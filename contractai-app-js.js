import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Download, Calendar, Users, Building, DollarSign, Shield, FileCheck, AlertCircle, Sparkles, Brain, Zap } from 'lucide-react';

const ContractGenerator = () => {
  const [step, setStep] = useState('start');
  const [contractType, setContractType] = useState('');
  const [hasExistingContract, setHasExistingContract] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileError, setFileError] = useState('');
  const [formData, setFormData] = useState({
    // Datos del inmueble
    propertyAddress: '',
    propertyDescription: '',
    municipalReference: '',
    parcelNumber: '',
    
    // Datos del locador/vendedor
    ownerName: '',
    ownerDni: '',
    ownerAddress: '',
    ownerEmail: '',
    
    // Datos del locatario/comprador
    tenantName: '',
    tenantDni: '',
    tenantAddress: '',
    tenantEmail: '',
    familyMembers: '',
    
    // Garantes
    guarantor1Name: '',
    guarantor1Dni: '',
    guarantor1Address: '',
    guarantor1Email: '',
    guarantor1Job: '',
    guarantor2Name: '',
    guarantor2Dni: '',
    guarantor2Address: '',
    guarantor2Email: '',
    guarantor2Job: '',
    
    // Condiciones económicas
    monthlyAmount: '',
    depositAmount: '',
    startDate: '',
    endDate: '',
    contractDuration: '36',
    adjustmentType: 'CVS_CER',
    
    // Datos de la inmobiliaria
    realtorName: 'Germán E. Konrad',
    realtorNumber: '573',
    realtyCompany: 'KONRAD Inversiones + Desarrollos Inmobiliarios',
    realtyAddress: 'calle AMEGHINO Nº 602, Santa Rosa, La Pampa'
  });
  
  const fileInputRef = useRef(null);
  const [generatedContract, setGeneratedContract] = useState('');

  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return 'Solo se permiten archivos PDF, DOC, DOCX o TXT';
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return 'El archivo no puede ser mayor a 10MB';
    }
    
    return null;
  };

  const extractDataFromDocument = async (file) => {
    setIsProcessing(true);
    setFileError('');
    
    try {
      const validation = validateFile(file);
      if (validation) {
        setFileError(validation);
        setIsProcessing(false);
        return;
      }

      let text = '';
      
      if (file.type === 'application/pdf') {
        // Para PDFs necesitaríamos una librería como pdf-parse, por ahora mostramos error
        setFileError('Los archivos PDF requieren procesamiento especial. Por favor, convierte el archivo a TXT o DOC.');
        setIsProcessing(false);
        return;
      } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        // Para archivos Word necesitaríamos mammoth.js
        setFileError('Los archivos Word requieren procesamiento especial. Por favor, convierte el archivo a TXT.');
        setIsProcessing(false);
        return;
      } else {
        // Archivo de texto plano
        text = await file.text();
      }
      
      // Extraer datos usando patrones del contrato ejemplo
      const ownerMatch = text.match(/Entre el señor\s*\*{0,3}([^,*]+),?\s*DNI\s*([0-9.]+)/i);
      const tenantMatch = text.match(/como\s*\*{0,3}LOCATARIO\*{0,3},?\s*[^*]*\*{0,3}([^,*]+),?\s*DNI\s*([0-9.]+)/i);
      const addressMatch = text.match(/ubicado en\s*([^,]+)/i);
      const municipalRefMatch = text.match(/Referencia Municipal:\s*([0-9.]+)/i);
      const parcelMatch = text.match(/Partida Numero:\s*([0-9.]+)/i);
      const amountMatch = text.match(/suma de\s*\*{0,3}PESOS\s*([^(]*)\(([^)]*)\)/i);
      
      const extracted = {
        ownerName: ownerMatch ? ownerMatch[1].trim() : '',
        ownerDni: ownerMatch ? ownerMatch[2].trim() : '',
        tenantName: tenantMatch ? tenantMatch[1].trim() : '',
        tenantDni: tenantMatch ? tenantMatch[2].trim() : '',
        propertyAddress: addressMatch ? addressMatch[1].trim() : '',
        municipalReference: municipalRefMatch ? municipalRefMatch[1].trim() : '',
        parcelNumber: parcelMatch ? parcelMatch[1].trim() : '',
        monthlyAmount: amountMatch ? amountMatch[2].replace(/[$.]/g, '') : ''
      };
      
      setExtractedData(extracted);
      setFormData(prev => ({ ...prev, ...extracted }));
      setStep('form');
    } catch (error) {
      setFileError('Error al procesar el archivo. Verifica que sea un documento válido y legible.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      extractDataFromDocument(file);
    }
  };

  const getAdjustmentClause = () => {
    switch (formData.adjustmentType) {
      case 'CVS_CER':
        return `Conforme al Artículo 5° de la Ley 27.737, (que modifica el Art. 14° de la Ley 27.551), los ajustes en los contratos de locación de inmuebles con destino "habitacional" el precio del alquiler debe fijarse como valor único, en moneda nacional, y por periodos mensuales, sobre el cual podrán realizarse ajustes con la periodicidad que acuerden las partes y por intervalos no inferiores a seis (6) meses. Dichos ajustes deberán efectuarse utilizando un coeficiente conformado por la menor variación que surja de comparar el promedio del 0,90 de la variación del Coeficiente de Variación Salarial (CVS), publicado por el INDEC y la Variación del Coeficiente de Estabilización de Referencia (CER), publicado por el Banco Central de la República Argentina (BCRA).`;
      
      case 'ICL':
        return `Los ajustes se realizarán cada seis (6) meses utilizando el Índice de Contratos de Locación (ICL) publicado por el Banco Central de la República Argentina (BCRA), conforme a la normativa vigente. Este índice surge del promedio de la variación del Índice de Precios al Consumidor (IPC) y del Coeficiente de Variación Salarial (CVS).`;
      
      case 'IPC':
        return `Los ajustes se realizarán cada seis (6) meses aplicando la variación del Índice de Precios al Consumidor (IPC) publicado por el Instituto Nacional de Estadística y Censos (INDEC), tomando como base el mes de inicio del contrato y el mes en que se efectúe cada ajuste.`;
      
      case 'FIJO':
        return `Las partes acuerdan que el valor del alquiler permanecerá fijo durante todo el período contractual, sin aplicación de ajustes por variación de índices. Cualquier modificación deberá ser acordada expresamente por las partes mediante addenda al presente contrato.`;
      
      default:
        return '';
    }
  };

  const generateContract = () => {
    let contract = '';
    
    if (contractType === 'locacion') {
      contract = generateLocacionContract();
    } else if (contractType === 'compraventa') {
      contract = generateCompraventaContract();
    } else if (contractType === 'comercial') {
      contract = generateComercialContract();
    }
    
    setGeneratedContract(contract);
    setStep('preview');
  };

  const generateLocacionContract = () => {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(formData.contractDuration));
    
    return `**CONTRATO DE LOCACIÓN**

Entre el señor ${formData.ownerName}, DNI ${formData.ownerDni}, con domicilio en ${formData.ownerAddress}, de la Ciudad de Santa Rosa, Provincia de La Pampa, por una parte y como LOCADOR, y por la otra y como LOCATARIO, ${formData.tenantName}, DNI ${formData.tenantDni}, con domicilio en el inmueble objeto de ésta Locación y con domicilio electrónico ${formData.tenantEmail}, todos mayores de edad y hábiles para contratar, han convenido en celebrar el presente CONTRATO DE LOCACIÓN, bajo las condiciones que se establecen a continuación:

ACERCA DEL INMUEBLE

PRIMERA: El LOCADOR cede en locación al LOCATARIO, un inmueble de su propiedad, ubicado en ${formData.propertyAddress}, de la Ciudad de Santa Rosa (CP6300), Provincia de La Pampa.

Referencia Municipal: ${formData.municipalReference} /// Partida Numero: ${formData.parcelNumber}

${formData.propertyDescription}

El inmueble será destinado para VIVIENDA para el Locatario y su grupo familiar (${formData.familyMembers} personas), no pudiéndose cambiar este destino bajo ningún concepto.

CONDICIONES DEL CONTRATO

SEGUNDA: Se establece la duración de este contrato en un plazo de ${formData.contractDuration} meses, a partir del día ${startDate.toLocaleDateString('es-AR')} y hasta el día ${endDate.toLocaleDateString('es-AR')}, sin obligación de notificar que fenece (Art. 1198 del C. Civil y Comercial)- a cuyo vencimiento el LOCATARIO se compromete a restituir la unidad y las llaves en el domicilio del LOCADOR o donde posteriormente este se lo indicare, sin necesidad de interpelación judicial o extrajudicial alguna y sin derecho a plazo suplementario alguno.

TERCERA: Se acuerda entre las partes como precio de LOCACIÓN INICIAL para los 6 primeros meses de contrato, la suma de PESOS ${formData.monthlyAmount} ($ ${formData.monthlyAmount}.-) mensuales, consecutivos y en efectivo; los aumentos siguientes serán cada 6 meses. ${getAdjustmentClause()} Por tal motivo a partir del mes séptimo y sobre la base mencionada ($ ${formData.monthlyAmount}) habrá un primer reajuste y aumento del alquiler equivalente al índice correspondiente; a partir de este y cada seis (6) meses habrá un nuevo aumento y/o actualización de valor, siendo estos acumulativos partiendo siempre del valor del semestre anterior al que deba actualizarse.

INTERVENCIÓN DEL CORREDOR DE COMERCIO

CUARTA: Se deja constancia que ha intervenido en la concertación del presente contrato la firma "${formData.realtyCompany}", representada por su titular el Corredor de Comercio ${formData.realtorName}, Colegiado N° ${formData.realtorNumber}. A éste el LOCADOR le reconocerá los honorarios correspondientes pactados.

SOBRE LAS GARANTÍAS

DECIMAPRIMERA: A fin de garantizar el fiel cumplimiento de éste contrato y de todas las obligaciones contraídas por el LOCATARIO, éste entrega al LOCADOR en calidad de depósito, un Documento Pagaré sin protesto, por la suma de PESOS ${formData.depositAmount} ($ ${formData.depositAmount}.-), el cual quedará en poder de esta inmobiliaria durante el periodo de locación.

${formData.guarantor1Name ? `DECIMASEGUNDA: El Señor ${formData.guarantor1Name}, DNI ${formData.guarantor1Dni}, con domicilio en ${formData.guarantor1Address}, y con domicilio electrónico ${formData.guarantor1Email}, quien declara ser ${formData.guarantor1Job}${formData.guarantor2Name ? `, y el señor ${formData.guarantor2Name}, DNI ${formData.guarantor2Dni}, con domicilio en ${formData.guarantor2Address}, y con domicilio electrónico ${formData.guarantor2Email}, quien declara ser ${formData.guarantor2Job}` : ''}, presentando los recibos de sueldo correspondientes, se constituyen en Garantes Fiadores, solidarios, lisos, llanos y principales pagadores de todas y cada una de las obligaciones especificadas en el presente Contrato.` : ''}

EN PRUEBA DE TOTAL CONFORMIDAD, y para su constancia y cumplimiento, las partes firman tres ejemplares de un mismo tenor y a un solo efecto en la Ciudad de Santa Rosa, Provincia de La Pampa, al ${new Date().toLocaleDateString('es-AR')}.

________________________                    ________________________
${formData.ownerName}                        ${formData.tenantName}
LOCADOR                                     LOCATARIO

${formData.guarantor1Name ? `________________________                    ________________________
${formData.guarantor1Name}                   ${formData.guarantor2Name || ''}
GARANTE                                     ${formData.guarantor2Name ? 'GARANTE' : ''}` : ''}`;
  };

  const generateCompraventaContract = () => {
    return `**CONTRATO DE COMPRAVENTA**

Entre el señor ${formData.ownerName}, DNI ${formData.ownerDni}, con domicilio en ${formData.ownerAddress}, de la Ciudad de Santa Rosa, Provincia de La Pampa, en adelante denominado "VENDEDOR", y ${formData.tenantName}, DNI ${formData.tenantDni}, con domicilio en ${formData.tenantAddress}, en adelante denominado "COMPRADOR", convienen el presente CONTRATO DE COMPRAVENTA:

PRIMERA: El VENDEDOR vende al COMPRADOR el inmueble ubicado en ${formData.propertyAddress}, de la Ciudad de Santa Rosa, Provincia de La Pampa.

Referencia Municipal: ${formData.municipalReference} /// Partida Numero: ${formData.parcelNumber}

SEGUNDA: El precio de venta se fija en la suma de PESOS ${formData.monthlyAmount} ($ ${formData.monthlyAmount}.-), que el COMPRADOR abona de la siguiente manera: [Especificar forma de pago]

TERCERA: Se deja constancia que ha intervenido en la concertación del presente contrato la firma "${formData.realtyCompany}", representada por su titular el Corredor de Comercio ${formData.realtorName}, Colegiado N° ${formData.realtorNumber}.

EN PRUEBA DE CONFORMIDAD, se firman dos ejemplares en Santa Rosa, La Pampa, al ${new Date().toLocaleDateString('es-AR')}.

________________________                    ________________________
${formData.ownerName}                        ${formData.tenantName}
VENDEDOR                                    COMPRADOR`;
  };

  const generateComercialContract = () => {
    return generateLocacionContract().replace('VIVIENDA', 'USO COMERCIAL').replace('grupo familiar', 'actividad comercial');
  };

  const downloadContract = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContract], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `contrato_${contractType}_${formData.tenantName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (step === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-50">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          </div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-6xl mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <Brain className="w-12 h-12 text-cyan-400" />
                  <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ContractAI
                </h1>
              </div>
              <p className="text-xl text-slate-300 mb-2">Generador Inteligente de Contratos</p>
              <p className="text-slate-400 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Potenciado por Inteligencia Artificial
                <Zap className="w-4 h-4 text-yellow-400" />
              </p>
            </div>

            {/* Main Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 lg:p-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-4">¿Qué tipo de contrato necesitas generar?</h2>
                <p className="text-slate-300">Selecciona el tipo de contrato y nuestro AI lo generará automáticamente</p>
              </div>
              
              {/* Contract Type Selection */}
              <div className="grid lg:grid-cols-3 gap-6 mb-10">
                {[
                  { id: 'locacion', title: 'Locación Residencial', icon: Building, desc: 'Contratos de alquiler para vivienda', gradient: 'from-blue-500 to-cyan-500' },
                  { id: 'compraventa', title: 'Compraventa', icon: FileText, desc: 'Contratos de compra y venta', gradient: 'from-purple-500 to-pink-500' },
                  { id: 'comercial', title: 'Locación Comercial', icon: DollarSign, desc: 'Contratos de alquiler comercial', gradient: 'from-green-500 to-emerald-500' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setContractType(type.id)}
                    className={`group relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      contractType === type.id 
                        ? 'bg-gradient-to-br ' + type.gradient + ' shadow-2xl shadow-' + type.id 
                        : 'bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700/70'
                    }`}
                  >
                    <div className="relative z-10">
                      <type.icon className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                        contractType === type.id ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`} />
                      <h3 className={`font-bold text-lg mb-2 transition-colors ${
                        contractType === type.id ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}>{type.title}</h3>
                      <p className={`text-sm transition-colors ${
                        contractType === type.id ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-300'
                      }`}>{type.desc}</p>
                    </div>
                    {contractType === type.id && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* File Upload Section */}
              {contractType && (
                <div className="border-t border-slate-700/50 pt-8">
                  <h3 className="text-2xl font-semibold text-white mb-6 text-center">¿Tienes un contrato previo?</h3>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <button
                      onClick={() => {
                        setHasExistingContract(false);
                        setStep('form');
                      }}
                      className="group p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 text-left"
                    >
                      <FileText className="w-10 h-10 mb-4 text-green-400 group-hover:scale-110 transition-transform" />
                      <h4 className="font-semibold text-white text-lg mb-2">Propiedad Nueva</h4>
                      <p className="text-slate-300">Crear contrato desde cero con todos los datos nuevos</p>
                    </button>
                    
                    <button
                      onClick={() => {
                        setHasExistingContract(true);
                        fileInputRef.current?.click();
                      }}
                      disabled={isProcessing}
                      className="group p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300 text-left disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Upload className={`w-10 h-10 text-blue-400 transition-transform ${isProcessing ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                        {isProcessing && <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />}
                      </div>
                      <h4 className="font-semibold text-white text-lg mb-2">
                        {isProcessing ? 'Procesando Contrato...' : 'Importar Contrato Previo'}
                      </h4>
                      <p className="text-slate-300 mb-3">
                        {isProcessing ? 'Extrayendo datos con IA...' : 'Cargar contrato anterior para reutilizar datos'}
                      </p>
                      <div className="text-xs text-slate-400 bg-slate-800/50 rounded-lg p-2">
                        <strong>Formatos soportados:</strong> PDF, DOC, DOCX, TXT (máx. 10MB)
                      </div>
                    </button>
                  </div>

                  {/* File Error Display */}
                  {fileError && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-300">{fileError}</p>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-slate-400">
              <p className="text-sm">La Pampa, Argentina • Inmobiliaria KONRAD</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Aquí irían los otros pasos (form y preview) pero simplificados para este ejemplo
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div className="text-center text-white">
        <h2 className="text-2xl mb-4">Funcionalidad en desarrollo</h2>
        <button 
          onClick={() => setStep('start')}
          className="bg-cyan-500 text-white px-6 py-3 rounded-xl"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

function App() {
  return <ContractGenerator />;
}

export default App;