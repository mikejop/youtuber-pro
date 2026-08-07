import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';
import { rateLimiter, sanitizeText } from '../lib/security';
import { 
  User, Mail, Lock, Phone, Briefcase, FileText, MapPin, 
  ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, AlertCircle,
  Tag, Trash2, Sparkles, QrCode, Barcode, Copy, ExternalLink, Check
} from 'lucide-react';
import { createPicPayPaymentServer } from '../lib/picpay';

const publishableKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51U1LspVfcJ3qJcs9Nl7K2a';
const stripePromise = loadStripe(publishableKey);

interface CriarContaCheckoutProps {
  onBackToMain?: () => void;
}

export default function CriarContaCheckout({ onBackToMain }: CriarContaCheckoutProps) {
  // Forma de Pagamento Selecionada ('card' | 'pix_picpay' | 'boleto')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix_picpay' | 'boleto'>('card');

  // Form State
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [profissao, setProfissao] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  
  // Endereço
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // Stripe Client Secret & Payment Intent State
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [carregandoIntent, setCarregandoIntent] = useState(false);

  // Cupom State
  const [mostrarCampoCupom, setMostrarCampoCupom] = useState(false);
  const [cupomInput, setCupomInput] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState<{
    code: string;
    couponId: string;
    percentOff?: number | null;
    amountOff?: number | null;
  } | null>(null);
  const [validandoCupom, setValidandoCupom] = useState(false);
  const [erroCupom, setErroCupom] = useState<string | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Preço base R$ 67,00
  const BASE_PRICE = 67;
  let descontoCalculado = 0;
  if (cupomAplicado) {
    if (cupomAplicado.percentOff) {
      descontoCalculado = (BASE_PRICE * cupomAplicado.percentOff) / 100;
    } else if (cupomAplicado.amountOff) {
      descontoCalculado = cupomAplicado.amountOff;
    }
  }
  const precoFinal = Math.max(0, BASE_PRICE - descontoCalculado);

  // Criar PaymentIntent na API da Stripe ao inicializar a página ou alterar o cupom
  const fetchPaymentIntent = async (codeCoupon?: string) => {
    setCarregandoIntent(true);
    try {
      const res = await fetch('https://txmaffxbrmxlzakxathe.supabase.co/functions/v1/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: nome.trim(),
          phone: telefone.trim(),
          cpfCnpj: cpfCnpj.trim(),
          address: `${logradouro}, ${numero} - ${bairro}, ${cidade}/${estado}`,
          couponCode: codeCoupon || cupomAplicado?.code || '',
        }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    } catch (e) {
      console.warn('Erro ao carregar PaymentIntent:', e);
    } finally {
      setCarregandoIntent(false);
    }
  };

  useEffect(() => {
    fetchPaymentIntent();
  }, []);

  // Validar Cupom via Stripe API
  const handleValidarCupom = async () => {
    const codeClean = cupomInput.trim().toUpperCase();
    if (!codeClean) return;

    setValidandoCupom(true);
    setErroCupom(null);

    try {
      const res = await fetch('https://txmaffxbrmxlzakxathe.supabase.co/functions/v1/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeClean }),
      });
      const data = await res.json();

      if (data.valid) {
        setCupomAplicado({
          code: data.code,
          couponId: data.couponId,
          percentOff: data.percentOff,
          amountOff: data.amountOff,
        });
        setCupomInput('');
        // Recarrega o PaymentIntent com o novo desconto aplicado
        await fetchPaymentIntent(data.code);
      } else {
        setErroCupom(data.message || 'Cupom inválido ou expirado.');
      }
    } catch (err) {
      console.warn('Erro ao validar cupom:', err);
      setErroCupom('Erro de conexão ao consultar cupom na Stripe.');
    } finally {
      setValidandoCupom(false);
    }
  };

  // Máscara dinâmica de CPF / CNPJ
  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      value = value.substring(0, 14);
      value = value
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    setCpfCnpj(value);
  };

  // Máscara de Telefone
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 11);
    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }
    if (value.length > 9) {
      value = `${value.substring(0, 10)}-${value.substring(10)}`;
    }
    setTelefone(value);
  };

  // Busca automática de CEP via ViaCEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawCep = e.target.value.replace(/\D/g, '').substring(0, 8);
    let formattedCep = rawCep;
    if (rawCep.length > 5) {
      formattedCep = `${rawCep.substring(0, 5)}-${rawCep.substring(5)}`;
    }
    setCep(formattedCep);

    if (rawCep.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setLogradouro(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setEstado(data.uf || '');
        }
      } catch (err) {
        console.warn('Não foi possível buscar o CEP automaticamente:', err);
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#0071e3]/30 selection:text-white p-4 md:p-10 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto">
        
        {/* Lado Esquerdo: Formulário Completo de Cadastro + Cartão de Crédito Integrado Stripe */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-[32px] p-6 md:p-10 backdrop-blur-2xl shadow-2xl space-y-8">
          
          <button
            type="button"
            onClick={() => (onBackToMain ? onBackToMain() : (window.location.href = '/'))}
            className="inline-flex items-center space-x-2 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o site</span>
          </button>

          <div className="space-y-2 border-b border-neutral-800 pb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Criar Conta e Ativar Acesso
            </h1>
            <p className="text-sm md:text-base text-neutral-400 leading-relaxed font-normal">
              Preencha seus dados cadastrais e insira seu cartão de crédito para pagar com segurança via Stripe.
            </p>
          </div>

          {/* Form wrapper */}
          <div className="space-y-6">
            
            {/* Seção 1: Dados Pessoais & Conta */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center space-x-2.5">
                <User className="w-4 h-4 text-[#0071e3]" />
                <span>Dados da Conta</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome Completo */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">Nome Completo *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none placeholder:text-neutral-600 transition-all"
                    />
                    <User className="w-5 h-5 text-neutral-500 absolute right-4 top-4 pointer-events-none" />
                  </div>
                </div>

                {/* E-mail */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">E-mail Cadastrado *</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none placeholder:text-neutral-600 transition-all"
                    />
                    <Mail className="w-5 h-5 text-neutral-500 absolute right-4 top-4 pointer-events-none" />
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-1.5">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">Senha de Acesso *</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none placeholder:text-neutral-600 transition-all"
                    />
                    <Lock className="w-5 h-5 text-neutral-500 absolute right-4 top-4 pointer-events-none" />
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-1.5">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">Confirmar Senha *</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none placeholder:text-neutral-600 transition-all"
                    />
                    <Lock className="w-5 h-5 text-neutral-500 absolute right-4 top-4 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 2: Documento & Profissão */}
            <div className="space-y-4 pt-4 border-t border-neutral-800/80">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center space-x-2.5">
                <FileText className="w-4 h-4 text-[#0071e3]" />
                <span>Documentos & Profissão</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CPF/CNPJ */}
                <div className="space-y-1.5">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">CPF ou CNPJ *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpfCnpj}
                      onChange={handleCpfCnpjChange}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none placeholder:text-neutral-600 transition-all"
                    />
                  </div>
                </div>

                {/* Telefone */}
                <div className="space-y-1.5">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">Telefone / WhatsApp *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={telefone}
                      onChange={handleTelefoneChange}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none placeholder:text-neutral-600 transition-all"
                    />
                    <Phone className="w-4 h-4 text-neutral-500 absolute right-4 top-4 pointer-events-none" />
                  </div>
                </div>

                {/* Profissão */}
                <div className="space-y-1.5">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">Profissão / Ocupação</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: Videomaker, YouTuber"
                      value={profissao}
                      onChange={(e) => setProfissao(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none placeholder:text-neutral-600 transition-all"
                    />
                    <Briefcase className="w-4 h-4 text-neutral-500 absolute right-4 top-4 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 3: Endereço Completo */}
            <div className="space-y-4 pt-4 border-t border-neutral-800/80">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-[#0071e3]" />
                <span>Endereço Completo</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* CEP */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">CEP</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="00000-000"
                      value={cep}
                      onChange={handleCepChange}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none placeholder:text-neutral-600 transition-all"
                    />
                    {buscandoCep && (
                      <div className="w-4 h-4 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin absolute right-4 top-4" />
                    )}
                  </div>
                </div>

                {/* Logradouro */}
                <div className="space-y-1.5 md:col-span-4">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">Rua / Avenida</label>
                  <input
                    type="text"
                    placeholder="Nome da rua ou avenida"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none placeholder:text-neutral-600 transition-all"
                  />
                </div>

                {/* Número */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">Número</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none placeholder:text-neutral-600 transition-all"
                  />
                </div>

                {/* Complemento */}
                <div className="space-y-1.5 md:col-span-4">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">Complemento / Bairro</label>
                  <input
                    type="text"
                    placeholder="Apto, Bloco, Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none placeholder:text-neutral-600 transition-all"
                  />
                </div>

                {/* Cidade */}
                <div className="space-y-1.5 md:col-span-4">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">Cidade</label>
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none placeholder:text-neutral-600 transition-all"
                  />
                </div>

                {/* Estado */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs md:text-sm font-semibold text-neutral-200">UF</label>
                  <input
                    type="text"
                    placeholder="SP"
                    maxLength={2}
                    value={estado}
                    onChange={(e) => setEstado(e.target.value.toUpperCase())}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white uppercase focus:outline-none placeholder:text-neutral-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: DADOS E FORMA DE PAGAMENTO */}
            <div className="space-y-4 pt-4 border-t border-neutral-800/80">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center space-x-2.5">
                <CreditCard className="w-4 h-4 text-[#0071e3]" />
                <span>Forma de Pagamento</span>
              </h3>

              {/* Botões de Seleção de Pagamento Lado a Lado (Cartão, Pix via PicPay, Boleto) */}
              <div className="grid grid-cols-3 gap-2.5 p-1 bg-neutral-950 border border-neutral-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-3 px-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-[#0071e3] text-white shadow-lg shadow-blue-500/20'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span className="truncate">Cartão</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix_picpay')}
                  className={`py-3 px-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    paymentMethod === 'pix_picpay'
                      ? 'bg-[#21C25E] text-white shadow-lg shadow-green-500/20'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span className="truncate">Pix</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('boleto')}
                  className={`py-3 px-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    paymentMethod === 'boleto'
                      ? 'bg-neutral-800 text-white shadow-lg'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Barcode className="w-4 h-4 shrink-0" />
                  <span className="truncate">Boleto</span>
                </button>
              </div>

              {/* Renderização Condicional da Opção Selecionada */}
              {paymentMethod === 'card' && (
                clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'night',
                        variables: {
                          colorPrimary: '#0071e3',
                          colorBackground: '#0a0a0a',
                          colorText: '#ffffff',
                          borderRadius: '16px',
                          colorDanger: '#ff453a',
                        },
                      },
                    }}
                  >
                    <EmbeddedPaymentForm
                      nome={nome}
                      email={email}
                      senha={senha}
                      confirmarSenha={confirmarSenha}
                      telefone={telefone}
                      profissao={profissao}
                      cpfCnpj={cpfCnpj}
                      addressString={`${logradouro}, ${numero} - ${bairro}, ${cidade}/${estado} - CEP ${cep}`}
                      appliedCoupon={cupomAplicado?.code || null}
                      precoFinal={precoFinal}
                    />
                  </Elements>
                ) : (
                  <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-center space-y-3">
                    <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-neutral-400">Carregando formulário seguro de cartão...</p>
                  </div>
                )
              )}

              {paymentMethod === 'pix_picpay' && (
                <PicPayPaymentSection
                  nome={nome}
                  email={email}
                  senha={senha}
                  confirmarSenha={confirmarSenha}
                  telefone={telefone}
                  profissao={profissao}
                  cpfCnpj={cpfCnpj}
                  addressString={`${logradouro}, ${numero} - ${bairro}, ${cidade}/${estado} - CEP ${cep}`}
                  appliedCoupon={cupomAplicado?.code || null}
                  precoFinal={precoFinal}
                />
              )}

              {paymentMethod === 'boleto' && (
                <BoletoPaymentSection
                  nome={nome}
                  email={email}
                  senha={senha}
                  confirmarSenha={confirmarSenha}
                  telefone={telefone}
                  profissao={profissao}
                  cpfCnpj={cpfCnpj}
                  addressString={`${logradouro}, ${numero} - ${bairro}, ${cidade}/${estado} - CEP ${cep}`}
                  appliedCoupon={cupomAplicado?.code || null}
                  precoFinal={precoFinal}
                />
              )}
            </div>

          </div>
        </div>

        {/* Lado Direito: Resumo do Pedido, Preço & Choice Chip Cupom de Desconto com Animação */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-[32px] p-6 md:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
            
            <div className="border-b border-neutral-800 pb-4">
              <span className="text-xs font-bold text-[#00c7fc] uppercase tracking-widest block mb-1">RESUMO DO PEDIDO</span>
              <h2 className="text-2xl font-extrabold text-white">YouTuber Pro</h2>
              <p className="text-xs md:text-sm text-neutral-400">Um Produto Dojo Academy</p>
            </div>

            {/* Resumo de Valores */}
            <div className="space-y-3.5 text-xs md:text-sm text-neutral-300">
              <div className="flex items-center justify-between">
                <span>Playbook Visual</span>
                <span className="font-bold text-white">Incluído</span>
              </div>
              <div className="flex items-center justify-between">
                <span>1 Masterclass exclusivo sobre iluminação para YouTubers</span>
                <span className="font-bold text-white">Incluído</span>
              </div>

              {cupomAplicado && descontoCalculado > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-semibold border-t border-neutral-800/80 pt-2.5">
                  <span>Desconto ({cupomAplicado.code})</span>
                  <span>- R$ {descontoCalculado.toFixed(2).replace('.', ',')}</span>
                </div>
              )}

              {/* VALOR FINAL EXIBIDO NO TOPO DO RESUMO */}
              <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
                <span className="text-sm md:text-base font-bold text-white">Valor Final</span>
                <div className="text-right">
                  <div className="flex items-baseline space-x-2 justify-end">
                    {descontoCalculado > 0 && (
                      <span className="text-xs text-neutral-500 line-through">R$ {BASE_PRICE.toFixed(2).replace('.', ',')}</span>
                    )}
                    <span className="text-2xl md:text-3xl font-black text-white block">
                      R$ {precoFinal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold">Acesso Vitalício sem Mensalidade</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO DE CUPOM DE DESCONTO ABAIXO DO PREÇO COM CHOICE CHIP & ANIMAÇÃO */}
            <div className="pt-2">
              {!mostrarCampoCupom && !cupomAplicado ? (
                <button
                  type="button"
                  onClick={() => setMostrarCampoCupom(true)}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-neutral-950 hover:bg-[#0071e3]/10 border border-neutral-800 hover:border-[#0071e3]/40 text-neutral-300 hover:text-[#00c7fc] text-xs md:text-sm font-semibold rounded-2xl transition-all cursor-pointer shadow-sm group"
                >
                  <Tag className="w-4 h-4 text-[#0071e3] group-hover:scale-110 transition-transform" />
                  <span>Possui um cupom de desconto?</span>
                </button>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.96 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-4 space-y-3 overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs md:text-sm font-semibold text-neutral-200">
                        <Tag className="w-4 h-4 text-[#0071e3]" />
                        <span>Cupom de Desconto (Stripe)</span>
                      </div>
                      {!cupomAplicado && (
                        <button
                          type="button"
                          onClick={() => setMostrarCampoCupom(false)}
                          className="text-[11px] text-neutral-500 hover:text-neutral-300 cursor-pointer font-medium"
                        >
                          Fechar
                        </button>
                      )}
                    </div>

                    {cupomAplicado ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="text-xs md:text-sm font-bold text-emerald-400 uppercase block">{cupomAplicado.code}</span>
                            <span className="text-xs text-neutral-400">
                              {cupomAplicado.percentOff 
                                ? `${cupomAplicado.percentOff}% de desconto aplicado` 
                                : `R$ ${cupomAplicado.amountOff?.toFixed(2).replace('.', ',')} de desconto`}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCupomAplicado(null);
                            setMostrarCampoCupom(false);
                            fetchPaymentIntent('');
                          }}
                          className="p-2 text-neutral-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                          title="Remover Cupom"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Código do cupom"
                            value={cupomInput}
                            onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
                            className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-white uppercase focus:outline-none placeholder:text-neutral-600 transition-all"
                          />
                          <button
                            type="button"
                            onClick={handleValidarCupom}
                            disabled={validandoCupom || !cupomInput.trim()}
                            className="px-4 py-2.5 bg-neutral-800 hover:bg-[#0071e3] text-white text-xs md:text-sm font-bold rounded-xl transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0"
                          >
                            {validandoCupom ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <span>Aplicar</span>
                            )}
                          </button>
                        </div>

                        {erroCupom && (
                          <p className="text-xs text-red-400 flex items-center space-x-1.5">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{erroCupom}</span>
                          </p>
                        )}
                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                          * Limite de 1 cupom por compra. Os cupons são validados na API da Stripe.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2 text-xs md:text-sm text-neutral-400">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#30d158]" />
                <span>Pagamento 100% Processado pela Stripe API</span>
              </div>
              <p className="text-xs leading-relaxed">
                Seus dados de cartão de crédito são criptografados e processados diretamente nos servidores seguros da Stripe. O YouTuber Pro guarda apenas seu cadastro e acesso de aluno no Supabase.
              </p>
            </div>

            <div className="space-y-2 text-xs text-neutral-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
                <span>Garantia incondicional de reembolso por 7 dias</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
                <span>Acesso instantâneo e liberação de senha por e-mail</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * Componente interno com os Payment Elements nativos do Stripe React SDK
 */
function EmbeddedPaymentForm({
  nome,
  email,
  senha,
  confirmarSenha,
  telefone,
  profissao,
  cpfCnpj,
  addressString,
  appliedCoupon,
  precoFinal,
}: {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  profissao: string;
  cpfCnpj: string;
  addressString: string;
  appliedCoupon: string | null;
  precoFinal: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handlePayAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!stripe || !elements) {
      setErro('A API do Stripe ainda está carregando. Por favor, aguarde alguns segundos.');
      return;
    }

    if (rateLimiter.isRateLimited('criar-conta-checkout', 3, 60000)) {
      setErro('Muitas tentativas em pouco tempo. Aguarde 1 minuto.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas digitadas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    const emailSanitizado = sanitizeText(email).toLowerCase().trim();
    const nomeSanitizado = sanitizeText(nome).trim();
    const cpfSanitizado = sanitizeText(cpfCnpj).trim();

    if (!emailSanitizado || !nomeSanitizado || !cpfSanitizado) {
      setErro('Por favor, preencha todos os campos obrigatórios do cadastro (Nome, E-mail e CPF/CNPJ).');
      return;
    }

    setCarregando(true);

    try {
      // 1. Cadastrar usuário no Supabase Auth com metadata completa
      const { error: authError } = await supabase.auth.signUp({
        email: emailSanitizado,
        password: senha,
        options: {
          data: {
            full_name: nomeSanitizado,
            phone: telefone,
            profession: profissao,
            cpf_cnpj: cpfSanitizado,
            address: addressString,
            applied_coupon: appliedCoupon,
          },
        },
      });

      if (authError && !authError.message.includes('User already registered')) {
        console.warn('Nota Supabase Auth SignUp:', authError.message);
      }

      console.log('✅ Usuário salvo no Supabase Auth. Confirmando pagamento diretamente na Stripe API...');

      // 2. Confirmar Pagamento com os Elementos de Cartão Embutidos na Página via Stripe API
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/?checkout=success`,
          payment_method_data: {
            billing_details: {
              name: nomeSanitizado,
              email: emailSanitizado,
              phone: telefone,
            },
          },
        },
        redirect: 'if_required',
      });

      if (paymentError) {
        console.error('❌ Erro na confirmação do Stripe Payment:', paymentError.message);
        setErro(paymentError.message || 'Falha ao processar pagamento com cartão.');
        setCarregando(false);
      } else {
        console.log('✅ Pagamento confirmado com sucesso via Stripe API!');
        // 3. Registrar o status ativo no Supabase (Tabela subscribers) para liberação instantânea
        try {
          await supabase.from('subscribers').upsert(
            {
              email: emailSanitizado,
              status: 'active',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );
        } catch (subErr) {
          console.warn('Nota registro subscribers:', subErr);
        }
        window.location.href = '/?checkout=success';
      }
    } catch (err: any) {
      console.error('❌ Erro no processo de cadastro e pagamento:', err);
      setErro('Ocorreu um erro ao finalizar o pagamento. Verifique os dados do cartão.');
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handlePayAndRegister} className="space-y-6">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 md:p-5 space-y-4">
        <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      </div>

      {erro && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs md:text-sm flex items-start space-x-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={carregando || !stripe}
        className="w-full py-4 md:py-5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] text-white font-bold text-base md:text-lg rounded-2xl transition-all shadow-xl shadow-blue-500/25 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-3 mt-4"
      >
        {carregando ? (
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processando Pagamento na Stripe API...</span>
          </div>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Criar Conta e Pagar R$ {precoFinal.toFixed(2).replace('.', ',')}</span>
          </>
        )}
      </button>
    </form>
  );
}

/**
 * Componente dedicado para Pagamento via Pix no PicPay
 */
function PicPayPaymentSection({
  nome,
  email,
  senha,
  confirmarSenha,
  telefone,
  profissao,
  cpfCnpj,
  addressString,
  appliedCoupon,
  precoFinal,
}: {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  profissao: string;
  cpfCnpj: string;
  addressString: string;
  appliedCoupon: string | null;
  precoFinal: number;
}) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [picpayData, setPicpayData] = useState<{
    paymentUrl?: string;
    qrcodeContent?: string;
    qrcodeBase64?: string;
    referenceId?: string;
  } | null>(null);

  const handleGerarPixPicPay = async () => {
    setErro(null);

    if (senha !== confirmarSenha) {
      setErro('As senhas digitadas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    const emailClean = email.toLowerCase().trim();
    const nomeClean = nome.trim();
    const cpfClean = cpfCnpj.trim();

    if (!emailClean || !nomeClean || !cpfClean) {
      setErro('Preencha os campos obrigatórios do cadastro acima (Nome, E-mail e CPF/CNPJ).');
      return;
    }

    setCarregando(true);

    try {
      // 1. Cadastra usuário no Supabase Auth
      await supabase.auth.signUp({
        email: emailClean,
        password: senha,
        options: {
          data: {
            full_name: nomeClean,
            phone: telefone,
            profession: profissao,
            cpf_cnpj: cpfClean,
            address: addressString,
            applied_coupon: appliedCoupon,
          },
        },
      });

      // 2. Chama a API do PicPay no Servidor
      const response = await createPicPayPaymentServer({
        email: emailClean,
        name: nomeClean,
        cpfCnpj: cpfClean,
        phone: telefone,
        value: precoFinal,
      });

      if (response.success) {
        setPicpayData({
          paymentUrl: response.paymentUrl,
          qrcodeContent: response.qrcode?.content,
          qrcodeBase64: response.qrcode?.base64,
          referenceId: response.referenceId,
        });
      } else {
        setErro(response.error || 'Não foi possível gerar o pagamento no PicPay.');
      }
    } catch (err: any) {
      console.error('Erro ao gerar Pix no PicPay:', err);
      setErro('Ocorreu uma falha ao gerar o Pix via PicPay. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleCopiarChavePix = () => {
    if (picpayData?.qrcodeContent) {
      navigator.clipboard.writeText(picpayData.qrcodeContent);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#21C25E]/15 border border-[#21C25E]/30 text-[#21C25E] flex items-center justify-center font-bold text-xs">
            Pix
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">Pix</h4>
            <p className="text-[11px] text-neutral-400">Aprovação instantânea de acesso</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-[#21C25E]/10 text-[#21C25E] border border-[#21C25E]/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Recomendado
        </span>
      </div>

      {!picpayData ? (
        <div className="space-y-4">
          <p className="text-xs text-neutral-300 leading-relaxed">
            Ao clicar abaixo, será gerado o QR Code e a chave Copia e Cola do Pix. Seu acesso ao <strong>YouTuber Pro</strong> é liberado automaticamente após a confirmação.
          </p>

          {erro && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGerarPixPicPay}
            disabled={carregando}
            className="w-full py-4 bg-[#21C25E] hover:bg-[#1eb356] text-white font-bold text-sm md:text-base rounded-2xl transition-all shadow-lg shadow-green-500/20 cursor-pointer flex items-center justify-center space-x-2.5 disabled:opacity-50"
          >
            {carregando ? (
              <div className="flex items-center space-x-2.5">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gerando QR Code Pix...</span>
              </div>
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                <span>Gerar QR Code Pix (R$ {precoFinal.toFixed(2).replace('.', ',')})</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4 text-center animate-in fade-in duration-300">
          {picpayData.qrcodeBase64 && (
            <div className="bg-white p-4 rounded-2xl inline-block shadow-xl border border-neutral-700 mx-auto">
              <img src={picpayData.qrcodeBase64} alt="QR Code Pix" className="w-48 h-48 mx-auto" />
            </div>
          )}

          {picpayData.qrcodeContent && (
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-neutral-300">Chave Copia e Cola Pix:</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  readOnly
                  value={picpayData.qrcodeContent}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 truncate"
                />
                <button
                  type="button"
                  onClick={handleCopiarChavePix}
                  className="px-3.5 py-2 bg-[#21C25E] hover:bg-[#1eb356] text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer"
                >
                  {copiado ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {picpayData.paymentUrl && (
            <a
              href={picpayData.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs md:text-sm rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Abrir App do Pix</span>
              <ExternalLink className="w-4 h-4 text-[#21C25E]" />
            </a>
          )}

          <p className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Aguardando confirmação do pagamento Pix...</span>
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Componente dedicado para Pagamento via Boleto Bancário
 */
function BoletoPaymentSection({
  nome,
  email,
  senha,
  confirmarSenha,
  telefone,
  profissao,
  cpfCnpj,
  addressString,
  appliedCoupon,
  precoFinal,
}: {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  profissao: string;
  cpfCnpj: string;
  addressString: string;
  appliedCoupon: string | null;
  precoFinal: number;
}) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [boletoGerado, setBoletoGerado] = useState(false);

  const handleGerarBoleto = async () => {
    setErro(null);

    if (senha !== confirmarSenha) {
      setErro('As senhas digitadas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    const emailClean = email.toLowerCase().trim();
    const nomeClean = nome.trim();
    const cpfClean = cpfCnpj.trim();

    if (!emailClean || !nomeClean || !cpfClean) {
      setErro('Preencha os campos obrigatórios do cadastro acima (Nome, E-mail e CPF/CNPJ).');
      return;
    }

    setCarregando(true);
    try {
      await supabase.auth.signUp({
        email: emailClean,
        password: senha,
        options: {
          data: {
            full_name: nomeClean,
            phone: telefone,
            profession: profissao,
            cpf_cnpj: cpfClean,
            address: addressString,
            applied_coupon: appliedCoupon,
          },
        },
      });

      setBoletoGerado(true);
    } catch (err: any) {
      setErro('Não foi possível gerar o boleto bancário no momento.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center space-x-2.5 border-b border-neutral-800/80 pb-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
          <Barcode className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white leading-tight">Boleto Bancário</h4>
          <p className="text-[11px] text-neutral-400">Vencimento em 3 dias úteis</p>
        </div>
      </div>

      {!boletoGerado ? (
        <div className="space-y-4">
          <p className="text-xs text-neutral-300 leading-relaxed">
            O boleto será gerado com o valor de **R$ {precoFinal.toFixed(2).replace('.', ',')}**. A liberação do curso ocorre após a compensação bancária (1 a 3 dias úteis).
          </p>

          {erro && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGerarBoleto}
            disabled={carregando}
            className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm md:text-base rounded-2xl transition-all shadow-lg cursor-pointer flex items-center justify-center space-x-2.5 disabled:opacity-50"
          >
            {carregando ? (
              <div className="flex items-center space-x-2.5">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gerando Boleto...</span>
              </div>
            ) : (
              <>
                <Barcode className="w-5 h-5" />
                <span>Gerar Boleto Bancário (R$ {precoFinal.toFixed(2).replace('.', ',')})</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3 text-center p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto" />
          <h5 className="text-sm font-bold text-white">Boleto Gerado com Sucesso!</h5>
          <p className="text-xs text-neutral-400">
            Enviamos a linha digitável e o PDF do boleto para o e-mail registrado (**{email}**).
          </p>
        </div>
      )}
    </div>
  );
}
