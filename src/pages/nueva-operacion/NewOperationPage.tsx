import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import type { Debtor, FrontendData } from "@/features/nueva-operacion/types";
import { NuevaOperacionService } from "@/features/nueva-operacion/services/nueva-operacion.service";
import { Step1Upload } from "@/features/nueva-operacion/components/Step1Upload";
import { Step2Config } from "@/features/nueva-operacion/components/Step2Config";
import { Step3Closure } from "@/features/nueva-operacion/components/Step3Closure";

export function NewOperationPage() {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [xmlFiles, setXmlFiles] = React.useState<File[]>([]);
  const [isExtracting, setIsExtracting] = React.useState(false);

  const [rate, setRate] = React.useState("");
  const [commission, setCommission] = React.useState("");
  const [bulkSend, setBulkSend] = React.useState(false);
  const [globalEmails, setGlobalEmails] = React.useState<string[]>([]);
  const [clientName, setClientName] = React.useState("");
  const [clientRuc, setClientRuc] = React.useState("");
  const [debtors, setDebtors] = React.useState<Debtor[]>([]);

  const [comentario, setComentario] = React.useState("");
  const [additionalDocs, setAdditionalDocs] = React.useState<File[]>([]);
  const [requestAdvance, setRequestAdvance] = React.useState(false);
  const [advancePercent, setAdvancePercent] = React.useState("80");
  const [bank, setBank] = React.useState("");
  const [accountType, setAccountType] = React.useState("");
  const [currency, setCurrency] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");

  const handleNextStep1 = async () => {
    if (xmlFiles.length === 0) return;
    setIsExtracting(true);
    setError(null);

    try {
      const extractedData =
        await NuevaOperacionService.extractDebtors(xmlFiles);
      const invalidDocs = extractedData.filter((doc) => !doc.valid);

      if (invalidDocs.length > 0) {
        const errorMessages = invalidDocs
          .map((doc) => `Archivo "${doc.source_filename}": ${doc.error}`)
          .join("\n");
        setError(errorMessages);
        setIsExtracting(false);
        return;
      }

      if (extractedData.length > 0) {
        setClientName(extractedData[0].client_name);
        setClientRuc(extractedData[0].client_ruc);
      }

      const debtorMap = new Map();
      extractedData.forEach((doc) => {
        const key = doc.debtor_ruc;
        if (!debtorMap.has(key)) {
          debtorMap.set(key, {
            id: key,
            name: doc.debtor_name,
            xmlCount: 1,
            emails: [],
            sustentos: [],
            documents: [doc],
          });
        } else {
          const debtor = debtorMap.get(key);
          debtor.xmlCount += 1;
          debtor.documents.push(doc);
        }
      });

      const debtorsArray = Array.from(debtorMap.values());

      const debtorsWithEmails = await Promise.all(
        debtorsArray.map(async (debtor) => {
          try {
            const contactos = await NuevaOperacionService.getContactos(
              debtor.id,
            );
            const emailsGuardados = contactos.map((c: any) => c.email);
            return { ...debtor, emails: emailsGuardados };
          } catch (err) {
            return debtor;
          }
        }),
      );

      setDebtors(debtorsWithEmails);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "No se pudieron procesar los archivos XML.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleNextStep2 = () => {
    if (
      !rate.trim() ||
      isNaN(parseFloat(rate)) ||
      !commission.trim() ||
      isNaN(parseFloat(commission))
    ) {
      setError("La Tasa Aplicada y la Comisión Fija son obligatorias.");
      return;
    }
    const totalXmls = xmlFiles.length;
    const totalSustentos = debtors.reduce(
      (acc, d) => acc + d.sustentos.length,
      0,
    );
    if (totalXmls !== totalSustentos) {
      setError(
        `La cantidad de sustentos (${totalSustentos}) no coincide con la cantidad de XMLs (${totalXmls}).`,
      );
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleFinish = async () => {
    if (!comentario.trim()) {
      setError("El comentario de la operación es obligatorio.");
      return;
    }
    if (!bank || !accountType || !currency || !accountNumber.trim()) {
      setError("Todos los campos de la Cuenta de Desembolso son obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);

    const frontendData: FrontendData = {
      condiciones: {
        tasa: parseFloat(rate) || 0,
        comision: parseFloat(commission) || 0,
      },
      notificaciones: {
        nombre_cliente: clientName,
        ruc_cliente: clientRuc,
        correo_remitente: authUser?.email || "sin_correo@dominio.com",
        envio_conjunto: bulkSend,
        emails_globales: globalEmails,
        deudores: debtors.map((d) => ({
          id: d.id,
          nombre: d.name,
          emails: d.emails,
          documentos: d.documents,
          sustentos: d.sustentos.map((f) => f.name),
        })),
      },
      cierre: {
        comentario,
        solicita_adelanto: requestAdvance,
        porcentaje_adelanto: requestAdvance
          ? parseFloat(advancePercent) || 0
          : 0,
        cuenta_desembolso: {
          banco: bank,
          tipo_cuenta: accountType,
          moneda: currency,
          numero_cuenta: accountNumber,
        },
      },
    };

    const allSustentos = debtors.flatMap((d) => d.sustentos);

    try {
      await NuevaOperacionService.processOperation(
        frontendData,
        xmlFiles,
        allSustentos,
        additionalDocs,
      );
      navigate("/operaciones"); // Redirigimos al terminar
    } catch (err: any) {
      setError(err.message || "Ocurrió un error desconocido.");
    } finally {
      setLoading(false);
    }
  };

  const handleDropXML = (acceptedFiles: File[]) => {
    setXmlFiles((prev) => [...prev, ...acceptedFiles]);
    setError(null);
  };
  const handleRemoveXML = (index: number) =>
    setXmlFiles((prev) => prev.filter((_, i) => i !== index));
  const updateDebtorSustentos = (id: string, newFiles: File[]) =>
    setDebtors((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, sustentos: [...d.sustentos, ...newFiles] } : d,
      ),
    );
  const removeDebtorSustento = (id: string, indexToRemove: number) =>
    setDebtors((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              sustentos: d.sustentos.filter((_, i) => i !== indexToRemove),
            }
          : d,
      ),
    );

  const updateDebtorEmails = async (id: string, newEmails: string[]) => {
    const debtor = debtors.find((d) => d.id === id);
    if (!debtor) return;

    const emailsToAdd = newEmails.filter((e) => !debtor.emails.includes(e));
    const emailsToRemove = debtor.emails.filter((e) => !newEmails.includes(e));

    setDebtors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, emails: newEmails } : d)),
    );

    try {
      for (const email of emailsToAdd)
        await NuevaOperacionService.addContacto(id, email);
      for (const email of emailsToRemove)
        await NuevaOperacionService.deleteContacto(id, email);
    } catch (err) {
      console.error("Error sincronizando los contactos", err);
    }
  };

  const handleToggleBulkSend = (checked: boolean) => {
    setBulkSend(checked);
    if (checked) {
      const allDebtorEmails = debtors.flatMap((d) => d.emails);
      const uniqueEmails = Array.from(
        new Set([...globalEmails, ...allDebtorEmails]),
      );
      setGlobalEmails(uniqueEmails);
    }
  };

  return (
    <div className="space-y-6">
      <Header title="Nueva Operación" />

      <div className="max-w-4xl mx-auto pb-12 mt-4">
        {/* Stepper Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-600 -z-10 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>

            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="flex flex-col items-center gap-2 bg-[#f4f7fe] px-2"
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2",
                    step >= s
                      ? "bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-200"
                      : "bg-white border-slate-300 text-slate-400",
                  )}
                >
                  {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    step >= s ? "text-brand-700" : "text-slate-400",
                  )}
                >
                  {s === 1 && "Carga XML"}
                  {s === 2 && "Configuración"}
                  {s === 3 && "Cierre"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Step1Upload
                xmlFiles={xmlFiles}
                isExtracting={isExtracting}
                error={error}
                onDrop={handleDropXML}
                onRemove={handleRemoveXML}
                onNext={handleNextStep1}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Step2Config
                rate={rate}
                setRate={setRate}
                commission={commission}
                setCommission={setCommission}
                bulkSend={bulkSend}
                setBulkSend={handleToggleBulkSend}
                globalEmails={globalEmails}
                setGlobalEmails={setGlobalEmails}
                debtors={debtors}
                updateDebtorSustentos={updateDebtorSustentos}
                removeDebtorSustento={removeDebtorSustento}
                updateDebtorEmails={updateDebtorEmails}
                error={error}
                onNext={handleNextStep2}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Step3Closure
                comentario={comentario}
                setComentario={setComentario}
                additionalDocs={additionalDocs}
                setAdditionalDocs={setAdditionalDocs}
                requestAdvance={requestAdvance}
                setRequestAdvance={setRequestAdvance}
                advancePercent={advancePercent}
                setAdvancePercent={setAdvancePercent}
                bank={bank}
                setBank={setBank}
                accountType={accountType}
                setAccountType={setAccountType}
                currency={currency}
                setCurrency={setCurrency}
                accountNumber={accountNumber}
                setAccountNumber={setAccountNumber}
                error={error}
                loading={loading}
                onFinish={handleFinish}
                onBack={handleBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
