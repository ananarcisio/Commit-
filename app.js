/* ===== DADOS ===== */
const desafios = [
  {id:1, titulo:"Lista de tarefas", trilha:"Front-end", nivel:"Iniciante", tempoH:6,
   tec:["HTML","CSS","JavaScript"], conclusoes:132, nota:4.6,
   resumo:"Crie um app para adicionar, concluir e remover tarefas, salvando tudo no navegador.",
   habilidades:["Manipulação do DOM","Eventos","LocalStorage"],
   checklist:["Adicionar uma tarefa","Marcar como concluída","Remover tarefa","Manter tarefas após recarregar a página"],
   ajuda:{titulo:"As tarefas somem ao recarregar", texto:"Salve a lista com localStorage.setItem('tarefas', JSON.stringify(lista)) sempre que ela mudar, e leia com JSON.parse no início da página."}},

  {id:2, titulo:"Catálogo de produtos", trilha:"Front-end", nivel:"Intermediário", tempoH:10,
   tec:["JavaScript","CSS"], conclusoes:84, nota:4.3,
   resumo:"Monte uma vitrine com filtros por categoria, busca e carrinho simples.",
   habilidades:["Arrays e objetos","Filtros","Layout com Grid"],
   checklist:["Listar produtos a partir de um array","Filtrar por categoria","Buscar por nome","Somar itens do carrinho"],
   ajuda:{titulo:"O filtro não atualiza a lista", texto:"Recalcule a lista filtrada a cada evento 'change' do select, e não só na primeira carga da página."}},

  {id:3, titulo:"Painel de assinatura SaaS", trilha:"SaaS", nivel:"Avançado", tempoH:30,
   tec:["React","Node.js","PostgreSQL"], conclusoes:21, nota:4.8,
   resumo:"Construa um painel com login, planos de assinatura e métricas de uso.",
   habilidades:["Autenticação","Modelagem de dados","APIs REST"],
   checklist:["Cadastro e login","Escolher plano","Dashboard com métricas","Bloquear recursos sem plano"],
   ajuda:{titulo:"Não sei proteger as rotas", texto:"Crie um middleware que confere o token antes de liberar o dashboard. Sem token válido, responda 401."}},

  {id:4, titulo:"Blog com editor (CMS)", trilha:"CMS", nivel:"Intermediário", tempoH:20,
   tec:["Node.js","Express","SQLite"], conclusoes:47, nota:4.5,
   resumo:"Crie um blog em que o autor escreve, publica e edita posts com permissões.",
   habilidades:["CRUD","Rotas","Controle de acesso"],
   checklist:["Criar post","Listar e publicar posts","Editar post","Perfis de autor e leitor"],
   ajuda:{titulo:"A edição do post não salva", texto:"Use uma rota PUT com o id do post. Atualize o registro no banco antes de responder ao cliente."}},

  {id:5, titulo:"Controle de férias (HRM)", trilha:"HRM", nivel:"Intermediário", tempoH:16,
   tec:["Python","Flask"], conclusoes:29, nota:4.4,
   resumo:"Sistema para cadastrar funcionários e solicitar, aprovar e acompanhar férias.",
   habilidades:["Regras de negócio","Fluxo de aprovação","Formulários"],
   checklist:["Cadastrar funcionário","Solicitar férias","Aprovar ou recusar","Ver saldo de dias"],
   ajuda:{titulo:"O saldo de férias fica negativo", texto:"Valide os dias solicitados contra o saldo antes de salvar a solicitação. Só desconte o saldo quando a férias for aprovada."}},

  {id:6, titulo:"Jogo da memória", trilha:"Jogos", nivel:"Iniciante", tempoH:4,
   tec:["JavaScript","HTML","CSS"], conclusoes:210, nota:4.7,
   resumo:"Tabuleiro de cartas que você vira em pares, contando jogadas e tempo.",
   habilidades:["Lógica condicional","Timers","Eventos de clique"],
   checklist:["Embaralhar cartas","Virar duas cartas por vez","Detectar par","Mostrar vitória ao final"],
   ajuda:{titulo:"As cartas não voltam", texto:"Use setTimeout de cerca de 1 segundo para desvirar as cartas que não formaram par."}}
];

/* ===== ESTADO ===== */
const estado = {
  logado:false,
  nivel:"Iniciante",
  passo:1,
  projetoTab:"andamento",
  atual:null,
  status:{},
  marcados:{},
  favoritos:new Set(),
  conquistas:[],
  perfil:{nome:"Aluno exemplo", decoracao:"nenhuma", visivel:false}
};
desafios.forEach(d=>estado.status[d.id]="Não iniciado");
estado.status[2]="Em andamento";

/* ===== HELPERS ===== */
const $ = id => document.getElementById(id);

function classificaTempo(h){ return h<=6 ? "curto" : (h<=16 ? "medio" : "longo"); }

function badges(d){
  return `<span class="badge nivel">Nível: ${d.nivel}</span>
          <span class="badge tipo">Tipo: ${d.trilha}</span>
          <span class="badge tempo">Tempo: ~${d.tempoH}h</span>
          <span class="badge status">Status: ${estado.status[d.id]}</span>`;
}

function cardDesafio(d){
  const salvo = estado.favoritos.has(d.id);
  return `
    <article class="card card-item">
      <div class="card-top">
        <h3>${d.titulo}</h3>
        <button class="bookmark ${salvo?"on":""}" data-act="fav" data-id="${d.id}" aria-label="Salvar desafio">🔖</button>
      </div>
      <p>${d.resumo}</p>
      <div>${badges(d)}</div>
      <p class="meta">★ ${d.nota.toFixed(1)} · ${d.conclusoes} pessoas concluíram</p>
      <p class="meta">Tecnologias: ${d.tec.join(", ")}</p>
      <button class="btn small" data-act="detalhe" data-id="${d.id}">Ver detalhes</button>
    </article>`;
}

function toast(msg){
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(()=>t.classList.remove("show"), 2600);
}

/* ===== NAVEGAÇÃO ===== */
const telasComLogin = ["projetos","perfil"];

const renders = {
  inicio: ()=>renderHome(),
  desafios: ()=>renderDesafios(),
  projetos: ()=>renderProjetos(),
  perfil: ()=>renderPerfil(),
  detalhe: ()=>renderDetalhe(estado.atual)
};

function renderAtual(){
  const ativa = document.querySelector("section.screen.active");
  if(ativa && renders[ativa.id]) renders[ativa.id]();
}

function ir(tela){
  if(telasComLogin.includes(tela) && !estado.logado){
    toast("Entre na sua conta para ver isso.");
    tela = "login";
  }
  document.querySelectorAll("section.screen").forEach(s=>s.classList.toggle("active", s.id===tela));
  const ativo = tela==="detalhe" ? "desafios" : tela;
  document.querySelectorAll("nav.menu button").forEach(b=>b.classList.toggle("active", b.dataset.go===ativo));
  window.scrollTo({top:0, behavior:"smooth"});
  renderAtual();
}

function entrar(msg){
  estado.logado = true;
  document.body.classList.add("logado");
  toast(msg);
  ir("inicio");
}

function abrirDetalhe(id){
  estado.atual = id;
  renderDetalhe(id);
  ir("detalhe");
}

/* ===== DELEGAÇÃO DE EVENTOS ===== */
const acoes = {
  fav: id=>toggleFav(id),
  detalhe: id=>abrirDetalhe(id),
  continuar: id=>abrirDetalhe(id),
  iniciar: id=>iniciar(id),
  concluir: id=>concluir(id),
  github: id=>irEntrega(id),
  voltar: ()=>obPasso(-1),
  avancar: ()=>avancarOnboarding(),
  olho: ()=>mostrarSenha(),
  salvarPerfil: ()=>salvarPerfil(),
  sair: ()=>{
    estado.logado = false;
    document.body.classList.remove("logado");
    toast("Você saiu da conta.");
    ir("inicio");
  }
};

document.addEventListener("click", e=>{
  const link = e.target.closest("a[href='#']");
  if(link) e.preventDefault();

  const t = e.target.closest("[data-toast]");
  if(t){ toast(t.dataset.toast); return; }

  const go = e.target.closest("[data-go]");
  if(go){ ir(go.dataset.go); return; }

  const tab = e.target.closest("[data-tab]");
  if(tab){ estado.projetoTab = tab.dataset.tab; renderProjetos(); return; }

  const social = e.target.closest("[data-social]");
  if(social){ entrar(`Login com ${social.dataset.social} (simulação)`); return; }

  const act = e.target.closest("[data-act]");
  if(act){
    const fn = acoes[act.dataset.act];
    if(fn) fn(Number(act.dataset.id));
  }
});

document.addEventListener("change", e=>{
  const c = e.target.closest("[data-check]");
  if(c){ marcarItem(Number(c.dataset.id), Number(c.dataset.i), c.checked); return; }
  if(e.target.closest("#filtros")) renderDesafios();
});

$("formLogin").addEventListener("submit", e=>{
  e.preventDefault();
  entrar("Login simulado com sucesso!");
});

/* ===== SENHA TEMPORÁRIA ===== */
function mostrarSenha(){
  const input = $("senha");
  const btn = $("btnOlho");
  input.type = "text";
  btn.textContent = "Ocultar";
  clearTimeout(input._h);
  input._h = setTimeout(()=>{
    input.type = "password";
    btn.textContent = "Mostrar";
  }, 3000);
}

/* ===== ONBOARDING ===== */
function obPasso(delta){
  estado.passo = Math.min(3, Math.max(1, estado.passo + delta));
  [1,2,3].forEach(n=>{
    $("ob"+n).hidden = n!==estado.passo;
    $("st"+n).classList.toggle("on", n===estado.passo);
  });
  $("btnVoltar").disabled = estado.passo===1;
  $("btnAvancar").textContent = estado.passo===3 ? "Finalizar e ver minha trilha" : "Avançar";
}

function avancarOnboarding(){
  if(estado.passo < 3) return obPasso(1);
  estado.nivel = $("nivel-ob").value;
  const obj = document.querySelector('input[name="obj"]:checked').value;
  estado.passo = 1;
  obPasso(0);
  entrar(`Trilha pronta para o nível ${estado.nivel} (objetivo: ${obj}).`);
}

/* ===== INÍCIO ===== */
function renderHome(){
  $("saudacao").textContent = estado.logado ? estado.perfil.nome : "visitante";
  $("nivelHome").textContent = estado.nivel;

  const emAnd = desafios.find(d=>estado.status[d.id]==="Em andamento");
  $("blocoContinuar").innerHTML = emAnd ? `
    <div class="cta-box">
      <h2>Continuar projeto</h2>
      <p><strong>${emAnd.titulo}</strong>. Travou em algum ponto? A ajuda fica dentro do desafio.</p>
      <div class="row">
        <button class="btn" data-act="continuar" data-id="${emAnd.id}">Continuar</button>
        <button class="btn ghost" data-act="github" data-id="${emAnd.id}">Criar repositório</button>
      </div>
    </div>` : "";

  const sugeridos = [
    ...desafios.filter(d=>d.nivel===estado.nivel),
    ...desafios.filter(d=>d.nivel!==estado.nivel)
  ].filter(d=>d!==emAnd).slice(0,2);
  $("homeSugeridos").innerHTML = sugeridos.map(cardDesafio).join("");

  $("homeSemana").innerHTML = cardDesafio(desafios.find(d=>d.id===2));

  $("homeAmigos").innerHTML = estado.logado ? `
    <ul class="lista">
      <li><strong>Ana</strong> concluiu <em>Catálogo de produtos</em></li>
      <li><strong>Luan</strong> concluiu <em>Jogo da memória</em></li>
      <li><strong>Rian</strong> começou <em>Blog com editor (CMS)</em></li>
    </ul>
    <p class="hint">Mostrando só amigos que aceitaram compartilhar.</p>`
  : `<p class="hint">Entre para ver as conquistas dos seus amigos. Só aparece quem aceitou compartilhar.</p>`;
}

/* ===== DESAFIOS ===== */
function filtrar(){
  const n = $("fNivel").value;
  const t = $("fTrilha").value;
  const tec = $("fTec").value;
  const tp = $("fTempo").value;
  const st = $("fStatus").value;
  return desafios.filter(d=>
    (!n || d.nivel===n) &&
    (!t || d.trilha===t) &&
    (!tec || d.tec.includes(tec)) &&
    (!tp || classificaTempo(d.tempoH)===tp) &&
    (!st || estado.status[d.id]===st)
  );
}

function renderDesafios(){
  const lista = filtrar();
  $("contagem").textContent = lista.length + (lista.length===1 ? " desafio encontrado" : " desafios encontrados");
  $("listaDesafios").innerHTML = lista.map(cardDesafio).join("") || "<p>Nenhum desafio com esses filtros. Tente remover algum.</p>";
}

function toggleFav(id){
  estado.favoritos.has(id) ? estado.favoritos.delete(id) : estado.favoritos.add(id);
  toast(estado.favoritos.has(id) ? "Desafio salvo" : "Removido dos salvos");
  renderAtual();
}

/* ===== DETALHE ===== */
function renderDetalhe(id){
  if(id==null || isNaN(id)) return;
  const d = desafios.find(x=>x.id===id);
  const marcados = estado.marcados[id] || [];
  const p = Math.round(marcados.length / d.checklist.length * 100);
  const concluido = estado.status[id]==="Concluído";
  const emAnd = estado.status[id]==="Em andamento";
  const salvo = estado.favoritos.has(id);

  $("detalheConteudo").innerHTML = `
    <h1>${d.titulo}</h1>
    <div>${badges(d)}</div>
    <p>${d.resumo}</p>
    <p class="meta">★ ${d.nota.toFixed(1)} de avaliação média · ${d.conclusoes} pessoas concluíram · Tempo estimado: ~${d.tempoH}h (você decide quando entregar)</p>

    <div class="grid2">
      <div><h3>Habilidades envolvidas</h3><p>${d.habilidades.join(" · ")}</p></div>
      <div><h3>Tecnologias recomendadas</h3><p>${d.tec.join(" · ")}</p></div>
    </div>

    <h3 style="margin-top:20px">Checklist de autoavaliação</h3>
    <div class="progress"><span style="width:${p}%"></span></div>
    <p class="hint">${p}% concluído</p>
    ${d.checklist.map((item,i)=>`
      <label class="check">
        <input type="checkbox" data-check data-id="${id}" data-i="${i}" ${marcados.includes(i)?"checked":""}>
        ${item}
      </label>`).join("")}

    <div class="row" style="margin-top:20px">
      ${concluido
        ? `<button class="btn" disabled>Concluído</button>`
        : `<button class="btn" data-act="iniciar" data-id="${id}" ${emAnd?"disabled":""}>${emAnd?"Em andamento":"Iniciar desafio"}</button>`}
      <button class="btn secondary" data-act="concluir" data-id="${id}">Marcar como concluído</button>
      <button class="btn ghost" data-act="fav" data-id="${id}">🔖 ${salvo?"Salvo":"Salvar"}</button>
    </div>

    ${emAnd ? `
      <div class="cta-box">
        <p><strong>Dica:</strong> crie o repositório agora. Assim o link já está pronto quando terminar.</p>
        <button class="btn ghost" data-act="github" data-id="${id}">Criar repositório agora</button>
      </div>` : ""}

    ${concluido ? `
      <div class="cta-box">
        <p><strong>Projeto concluído.</strong> Falta enviar o código para avaliação.</p>
        <button class="btn secondary" data-act="github" data-id="${id}">Ir para Entrega &amp; GitHub</button>
      </div>` : ""}

    <h3 style="margin-top:28px">Travou? Ajuda no ponto da dificuldade</h3>
    <div class="card card-item">
      <strong>${d.ajuda.titulo}</strong>
      <p class="hint" style="margin:6px 0 0">${d.ajuda.texto}</p>
    </div>

    <h3 style="margin-top:20px">Referências para estudo</h3>
    <p class="hint">Documentação oficial da tecnologia escolhida. Projetos de outros alunos, com votação da comunidade, entram em breve.</p>
  `;
}

function marcarItem(id, i, ok){
  const lista = estado.marcados[id] || [];
  estado.marcados[id] = ok ? [...lista, i] : lista.filter(x=>x!==i);
  if(estado.status[id]==="Não iniciado") estado.status[id] = "Em andamento";
  renderDetalhe(id);
}

function iniciar(id){
  estado.status[id] = "Em andamento";
  toast("Desafio iniciado. Crie o repositório agora para não esquecer a entrega.");
  renderDetalhe(id);
}

function concluir(id){
  const d = desafios.find(x=>x.id===id);
  const feitos = (estado.marcados[id] || []).length;
  if(feitos < d.checklist.length){
    toast("Marque todos os itens do checklist antes de concluir.");
    return;
  }
  estado.status[id] = "Concluído";
  estado.conquistas.push(`Concluiu: ${d.titulo}`);
  toast("Desafio concluído! Conquista desbloqueada 🎉");
  renderDetalhe(id);
}

/* ===== PROJETOS ===== */
function renderProjetos(){
  document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active", b.dataset.tab===estado.projetoTab));
  const alvo = estado.projetoTab==="andamento" ? "Em andamento" : "Concluído";
  const lista = desafios.filter(d=>estado.status[d.id]===alvo);
  $("listaProjetos").innerHTML = lista.length
    ? lista.map(d=>`
        <article class="card card-item">
          <h3>${d.titulo}</h3>
          <div>${badges(d)}</div>
          <div class="row" style="margin-top:8px">
            <button class="btn small" data-act="detalhe" data-id="${d.id}">Abrir</button>
            <button class="btn small ghost" data-act="github" data-id="${d.id}">Entrega &amp; GitHub</button>
          </div>
        </article>`).join("")
    : `<p>${alvo==="Concluído"
        ? "Nenhum projeto concluído ainda. Termine um checklist para ver aqui."
        : "Nenhum projeto em andamento. Escolha um desafio para começar."}</p>`;
}

/* ===== PERFIL ===== */
function atualizarAvatar(){
  const iniciais = estado.perfil.nome.split(" ").filter(Boolean).map(p=>p[0]).join("").slice(0,2).toUpperCase() || "?";
  const deco = {nenhuma:iniciais, estrela:`★${iniciais}★`, bolinha:`•${iniciais}•`}[estado.perfil.decoracao];
  document.querySelectorAll(".avatar").forEach(a=>a.textContent = deco);
}

function renderPerfil(){
  $("pNome").value = estado.perfil.nome;
  $("pDeco").value = estado.perfil.decoracao;
  $("pVisivel").checked = estado.perfil.visivel;
  atualizarAvatar();
  $("listaConquistas").innerHTML = estado.conquistas.length
    ? `<ul class="lista">${estado.conquistas.map(c=>`<li>🏅 ${c}</li>`).join("")}</ul>`
    : `<p class="hint">Conclua um desafio para desbloquear sua primeira conquista.</p>`;
}

function salvarPerfil(){
  estado.perfil = {
    nome: $("pNome").value.trim() || "Aluno",
    decoracao: $("pDeco").value,
    visivel: $("pVisivel").checked
  };
  atualizarAvatar();
  toast("Perfil salvo.");
}

/* ===== ENTREGA & GITHUB ===== */
function irEntrega(id){
  const d = desafios.find(x=>x.id===id);
  const slug = d.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
  $("gitProjeto").textContent = `Projeto: ${d.titulo} · Sugestão de nome do repositório: commit-${slug}`;
  ir("github");
}

/* ===== INÍCIO DA APLICAÇÃO ===== */
obPasso(0);
renderHome();
renderDesafios();
