import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { handleStripeCheckoutWithCustomerData, DEFAULT_PRICE_ID } from '../lib/stripe';
import { rateLimiter, sanitizeText } from '../lib/security';
import { 
  User, Mail, Lock, Phone, Briefcase, FileText, MapPin, 
  ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, Sparkles, AlertCircle 
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

  const [carregando, setCarregando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Máscara dinâmica de CPF / CNPJ
  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      // CPF: 000.000.000-00
      value = value
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 00.000.000/0001-00
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
    <div className="min-h-screen bg-black text-white selection:bg-[#0071e3]/30 selection:text-white p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto">
        
        {/* Lado Esquerdo: Formulário de Cadastro */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          
          <button
            type="button"
            onClick={() => (onBackToMain ? onBackToMain() : (window.location.href = '/'))}
            className="flex items-center space-x-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o site</span>
          </button>

          <div className="space-y-1.5 border-b border-neutral-800 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#0071e3]/10 border border-[#0071e3]/30 text-[#0071e3] text-[11px] font-bold rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inscrição Oficial</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Criar Conta e Ativar Acesso
            </h1>
            <p className="text-xs text-neutral-400">
              Preencha seus dados para criar sua conta no YouTuber Pro e prosseguir para o pagamento seguro.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Seção 1: Dados Pessoais & Conta */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>Dados da Conta</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Nome Completo */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-semibold text-neutral-300">Nome Completo *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-600"
                    />
                    <User className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* E-mail */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-semibold text-neutral-300">E-mail Cadastrado *</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-600"
                    />
                    <Mail className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-300">Senha de Acesso *</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-600"
                    />
                    <Lock className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-300">Confirmar Senha *</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-600"
                    />
                    <Lock className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 2: Documento & Profissão */}
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>Documentos & Profissão</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* CPF/CNPJ */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-300">CPF ou CNPJ *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpfCnpj}
                      onChange={handleCpfCnpjChange}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-600"
                    />
                  </div>
                </div>

                {/* Telefone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-300">Telefone / WhatsApp *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={telefone}
                      onChange={handleTelefoneChange}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-600"
                    />
                    <Phone className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Profissão */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-300">Profissão / Ocupação</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: Videomaker, YouTuber"
                      value={profissao}
                      onChange={(e) => setProfissao(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-600"
                    />
                    <Briefcase className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 3: Endereço Completo */}
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>Endereço Completo</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                {/* CEP */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-semibold text-neutral-300">CEP</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="00000-000"
                      value={cep}
                      onChange={handleCepChange}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-600"
                    />
                    {buscandoCep && (
                      <div className="w-3.5 h-3.5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin absolute right-3 top-3" />
                    )}
                  </div>
                </div>

                {/* Logradouro */}
                <div className="space-y-1 md:col-span-4">
                  <label className="text-[11px] font-semibold text-neutral-300">Rua / Avenida</label>
                  <input
                    type="text"
                    placeholder="Nome da rua ou avenida"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-600"
                  />
                </div>

                {/* Número */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-semibold text-neutral-300">Número</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-600"
                  />
                </div>

                {/* Complemento */}
                <div className="space-y-1 md:col-span-4">
                  <label className="text-[11px] font-semibold text-neutral-300">Complemento / Bairro</label>
                  <input
                    type="text"
                    placeholder="Apto, Bloco, Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-600"
                  />
                </div>

                {/* Cidade */}
                <div className="space-y-1 md:col-span-4">
                  <label className="text-[11px] font-semibold text-neutral-300">Cidade</label>
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-600"
                  />
                </div>

                {/* Estado */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-semibold text-neutral-300">UF</label>
                  <input
                    type="text"
                    placeholder="SP"
                    maxLength={2}
                    value={estado}
                    onChange={(e) => setEstado(e.target.value.toUpperCase())}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-3 py-2.5 text-xs text-white uppercase focus:outline-none placeholder:text-neutral-600"
                  />
                </div>
              </div>
            </div>

            {erro && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{erro}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-4 bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-blue-500/25 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 mt-4"
            >
              {carregando ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Criando Conta e Abrindo Checkout...</span>
                </div>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Criar Conta e Pagar no Stripe</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lado Direito: Resumo do Pedido & Garantia */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
            
            <div className="border-b border-neutral-800 pb-4">
              <span className="text-[10px] font-bold text-[#00c7fc] uppercase tracking-widest block mb-1">RESUMO DO PEDIDO</span>
              <h2 className="text-xl font-black text-white">YouTuber Pro Academy</h2>
              <p className="text-xs text-neutral-400">Guia de Sobrevivência & Simuladores 3D</p>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="flex items-center justify-between">
                <span>Playbook Visual (9 Módulos)</span>
                <span className="font-bold text-white">Incluído</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Simuladores 3D de Luz, CTR & Cor</span>
                <span className="font-bold text-white">Incluído</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Kit de Aceleração do Criador</span>
                <span className="font-bold text-white">Incluído</span>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                <span className="text-sm font-bold text-white">Valor Total</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-white block">R$ 67,00</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Acesso Vitalício sem Mensalidade</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2 text-xs text-neutral-400">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#30d158]" />
                <span>Pagamento 100% Processado pela Stripe</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Seus dados de cartão de crédito e pagamento são criptografados e processados diretamente nos servidores seguros da Stripe. O YouTuber Pro guarda apenas seu cadastro e acesso de aluno no Supabase.
              </p>
            </div>

            <div className="space-y-2 text-[11px] text-neutral-400">
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
