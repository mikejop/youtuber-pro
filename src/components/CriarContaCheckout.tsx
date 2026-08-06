import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { handleStripeCheckoutWithCustomerData, DEFAULT_PRICE_ID } from '../lib/stripe';
import { rateLimiter, sanitizeText } from '../lib/security';
import { 
  User, Mail, Lock, Phone, Briefcase, FileText, MapPin, 
  ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, AlertCircle,
  Tag, Trash2
} from 'lucide-react';

interface CriarContaCheckoutProps {
  onBackToMain?: () => void;
}

export default function CriarContaCheckout({ onBackToMain }: CriarContaCheckoutProps) {
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

  // Cupom State (Busca e Validação via Stripe API)
  const [cupomInput, setCupomInput] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState<{
    code: string;
    couponId: string;
    percentOff?: number | null;
    amountOff?: number | null;
    name?: string;
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

  // Função para validar o cupom na API da Stripe
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
          name: data.name,
        });
        setCupomInput('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

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
      setErro('Por favor, preencha todos os campos obrigatórios (Nome, E-mail e CPF/CNPJ).');
      return;
    }

    setCarregando(true);

    try {
      // 1. Cadastrar usuário no Supabase Auth com metadata completa
      const addressString = `${logradouro}, ${numero}${complemento ? ` (${complemento})` : ''} - ${bairro}, ${cidade}/${estado} - CEP ${cep}`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailSanitizado,
        password: senha,
        options: {
          data: {
            full_name: nomeSanitizado,
            phone: telefone,
            profession: profissao,
            cpf_cnpj: cpfSanitizado,
            address: addressString,
            applied_coupon: cupomAplicado?.code || null,
          },
        },
      });

      if (authError && !authError.message.includes('User already registered')) {
        console.warn('Nota Supabase Auth SignUp:', authError.message);
      }

      console.log('✅ Usuário registrado no Supabase Auth. Redirecionando para o Stripe Checkout...');

      // 2. Redirecionar diretamente para o Checkout Seguro do Stripe com e-mail preenchido
      await handleStripeCheckoutWithCustomerData({
        priceId: DEFAULT_PRICE_ID,
        email: emailSanitizado,
        name: nomeSanitizado,
        phone: telefone,
        profession: profissao,
        cpfCnpj: cpfSanitizado,
        address: addressString,
      });

    } catch (err: any) {
      console.error('❌ Erro no processo de criação de conta e checkout:', err);
      setErro('Ocorreu um erro ao processar seu cadastro. Tente novamente.');
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#0071e3]/30 selection:text-white p-4 md:p-10 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto">
        
        {/* Lado Esquerdo: Formulário de Cadastro (Estilo Apple.com Spacing & High Legibility) */}
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
              Preencha seus dados para criar sua conta no YouTuber Pro e prosseguir para o pagamento seguro.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
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

            {erro && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs md:text-sm flex items-start space-x-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{erro}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-4 md:py-5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] text-white font-bold text-base md:text-lg rounded-2xl transition-all shadow-xl shadow-blue-500/25 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-3 mt-6"
            >
              {carregando ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Criando Conta e Abrindo Checkout...</span>
                </div>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Criar Conta e Pagar no Stripe (R$ {precoFinal.toFixed(2).replace('.', ',')})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lado Direito: Resumo do Pedido, Cupom de Desconto & Garantia */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-[32px] p-6 md:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
            
            <div className="border-b border-neutral-800 pb-4">
              <span className="text-xs font-bold text-[#00c7fc] uppercase tracking-widest block mb-1">RESUMO DO PEDIDO</span>
              <h2 className="text-2xl font-extrabold text-white">YouTuber Pro Academy</h2>
              <p className="text-xs md:text-sm text-neutral-400">Guia de Sobrevivência & Simuladores 3D</p>
            </div>

            {/* SEÇÃO DE CUPOM DE DESCONTO STRIPE */}
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs md:text-sm font-semibold text-neutral-200">
                <Tag className="w-4 h-4 text-[#0071e3]" />
                <span>Cupom de Desconto (Stripe)</span>
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
                    onClick={() => setCupomAplicado(null)}
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
            </div>

            {/* Resumo de Valores */}
            <div className="space-y-3 text-xs md:text-sm text-neutral-300">
              <div className="flex items-center justify-between">
                <span>Playbook Visual (9 Módulos)</span>
                <span className="font-bold text-white">Incluído</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Simuladores 3D de Luz, CTR & Cor</span>
                <span className="font-bold text-white">Incluído</span>
              </div>

              {cupomAplicado && descontoCalculado > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-semibold border-t border-neutral-800/80 pt-2.5">
                  <span>Desconto ({cupomAplicado.code})</span>
                  <span>- R$ {descontoCalculado.toFixed(2).replace('.', ',')}</span>
                </div>
              )}

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

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2 text-xs md:text-sm text-neutral-400">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#30d158]" />
                <span>Pagamento 100% Processado pela Stripe</span>
              </div>
              <p className="text-xs leading-relaxed">
                Seus dados de cartão de crédito e pagamento são criptografados e processados diretamente nos servidores seguros da Stripe. O YouTuber Pro guarda apenas seu cadastro e acesso de aluno no Supabase.
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
