import type { Article, FaqItem, TocItem } from "./types";

/** Data da revisão editorial aplicada na renderização pública. */
export const EDITORIAL_REVISION = "2026-10-30";

const GUIA =
  "https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf";
const OMS_DIETA = "https://www.who.int/news-room/fact-sheets/detail/healthy-diet";
const OMS_ATIVIDADE = "https://www.who.int/news-room/fact-sheets/detail/physical-activity";
const OMS_MENTE =
  "https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response";
const CDC_SONO = "https://www.cdc.gov/sleep/";

type Extra = { opening: string; closing: string; faq: FaqItem[] };

function scope(text: string) {
  return `<aside class="article-scope" data-editorial-extra="1"><p><strong>O que este texto responde.</strong> ${text}</p></aside>`;
}

function practice(
  steps: string[],
  close: string,
  related: { href: string; label: string }[] = [],
  sources: { href: string; label: string }[] = []
) {
  const lis = steps.map((step) => `<li>${step}</li>`).join("");
  const rel = related.length
    ? `<h2 id="leituras-relacionadas">O que este texto não cobre</h2><p>Estes pontos ficam em outros artigos, de propósito, para cada página ter uma função clara:</p><ul>${related
        .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
        .join("")}</ul>`
    : "";
  const src = sources.length
    ? `<h2 id="referencias">Para ler na fonte</h2><ul>${sources
        .map(
          (item) =>
            `<li><a href="${item.href}" target="_blank" rel="noopener noreferrer">${item.label}</a></li>`
        )
        .join("")}</ul><p>Esses materiais são públicos e de instituições de saúde. Eles não transformam este texto em prescrição individual.</p>`
    : "";
  return `<h2 id="aplicacao-pratica">Como aplicar no seu dia</h2><ol>${lis}</ol><p>${close}</p>${rel}${src}`;
}

const EXTRAS: Record<string, Extra> = {
  "nutricao-consciente-alimentando-o-corpo-alem-das-calorias": {
    opening: scope(
      "Como perceber fome, pressa e distração na hora de comer. Não é um cardápio, não conta calorias e não trata compulsão alimentar."
    ),
    closing: practice(
      [
        "Antes da primeira garfada, deixe o celular virado para baixo e nomeie o que você sente: fome no estômago, vontade de doce, cansaço ou só o relógio marcando horário.",
        "Monte o prato com o que já tem em casa: um alimento que você mastiga (feijão, ovo, iogurte natural, carne ou lentilha), um vegetal e um alimento de verdade no lugar de um pacote.",
        "Apoie o talher na mesa entre algumas garfadas. A pausa serve para sentir gosto e quantidade, não para bater um tempo exato.",
        "Se a vontade de comer surgir longe das refeições, beba água, espere dez minutos e pergunte o que você faria se o alimento não existisse: descansar, sair da cadeira ou falar com alguém.",
      ],
      "Dor abdominal persistente, vômito, perda de peso sem explicação ou uma relação de medo com a comida pedem profissional de saúde, não uma regra nova de mastigação.",
      [
        {
          href: "/artigos/alimentacao-e-bem-estar-como-o-que-voce-come-molda-a-sua-saude-integral",
          label: "O que costuma entrar no prato ao longo da semana",
        },
        {
          href: "/artigos/espiritualidade-na-cozinha-o-poder-de-comer-prestando-atencao",
          label: "Comer com presença, sem transformar a refeição em dieta",
        },
      ],
      [
        { href: GUIA, label: "Guia Alimentar para a População Brasileira (Ministério da Saúde)" },
        { href: OMS_DIETA, label: "Alimentação saudável — Organização Mundial da Saúde" },
      ]
    ),
    faq: [
      {
        question: "Comer devagar emagrece?",
        answer:
          "Este texto não promete perda de peso. Comer com atenção ajuda a perceber saciedade e a escolher com menos pressa. Peso depende de sono, rotina, saúde e acompanhamento, quando for o caso.",
      },
      {
        question: "Chá antes da refeição melhora a digestão?",
        answer:
          "Um chá morno pode ser só um jeito de desacelerar. Não há, aqui, recomendação de erva, dose ou horário para tratar estômago, fígado ou azia.",
      },
      {
        question: "Fome emocional é falta de disciplina?",
        answer:
          "Não. É um sinal de que algo além do estômago está pedindo alívio. O passo útil é notar o contexto. Se isso se repete com sofrimento, um profissional é o caminho certo.",
      },
    ],
  },
  "alimentacao-e-bem-estar-como-o-que-voce-come-molda-a-sua-saude-integral": {
    opening: scope(
      "Como organizar o que você come na semana, com comida de verdade e menos ultraprocessados. A forma de prestar atenção na refeição está em outro texto."
    ),
    closing: practice(
      [
        "Olhe a despensa e a geladeira e separe três refeições que você já sabe fazer sem pacote pronto: arroz e feijão, ovo com legumes, sopa, fruta com iogurte natural.",
        "Na próxima compra, troque um item de pacote por um alimento que ainda parece comida: fruta, feijão, ovos, leite, legumes ou pão feito com poucos ingredientes.",
        "Leia o rótulo só para uma pergunta: a lista tem muitos nomes que você não usaria na cozinha? Se sim, deixe esse item para ocasiões, não para todo dia.",
        "Inclua água nas refeições. Suco, refrigerante e bebida adoçada não precisam sumir para sempre; o guia brasileiro sugere que não sejam a sede de todos os dias.",
      ],
      "Restrição rígida, dieta da moda e corte de grupos inteiros de alimentos não são o assunto deste texto. Quem tem doença, alergia ou orientação de nutricionista deve seguir o plano individual.",
      [
        {
          href: "/artigos/nutricao-consciente-alimentando-o-corpo-alem-das-calorias",
          label: "Como comer com atenção, sem contar calorias",
        },
        {
          href: "/artigos/hidratacao-profunda-a-agua-como-purificadora-das-celulas",
          label: "Água no dia a dia, sem meta universal de litros",
        },
      ],
      [
        { href: GUIA, label: "Guia Alimentar para a População Brasileira (Ministério da Saúde)" },
        { href: OMS_DIETA, label: "Alimentação saudável — Organização Mundial da Saúde" },
      ]
    ),
    faq: [
      {
        question: "Preciso cortar glúten, lactose ou açúcar?",
        answer:
          "Não, a menos que um profissional tenha indicado isso para você. O ponto prático daqui é comer mais comida de verdade e menos ultraprocessados.",
      },
      {
        question: "Comida de verdade é sempre cara?",
        answer:
          "Não necessariamente. Feijão, ovo, frutas da estação, arroz e legumes simples costumam caber melhor no mês do que lanches prontos todos os dias. O preço varia por cidade.",
      },
      {
        question: "Um dia fora da rotina estraga o esforço?",
        answer:
          "Não. O que pesa é o padrão da semana. Uma refeição diferente não apaga o restante dos dias.",
      },
    ],
  },
  "espiritualidade-na-cozinha-o-poder-de-comer-prestando-atencao": {
    opening: scope(
      "Como transformar uma refeição em pausa e presença. Não ensina o que comprar, não fala em calorias e não trata a cozinha como terapia."
    ),
    closing: practice(
      [
        "Escolha uma refeição do dia — pode ser o lanche — e coma sentado, sem série, sem rolagem de tela.",
        "Antes de começar, olhe o prato por alguns segundos e reconheça uma etapa que alguém fez: plantar, cozinhar, comprar ou servir.",
        "Na primeira garfada, nomeie um sabor ou uma textura. Isso ancora a atenção melhor do que tentar “não pensar em nada”.",
        "Se a mente fugir para a lista de tarefas, volte ao garfo. Não é falha. É o exercício.",
      ],
      "Presença na mesa não corrige um padrão alimentar que te faz mal, nem substitui cuidado com a saúde mental. Se comer virou punição ou culpa, procure ajuda.",
      [
        {
          href: "/artigos/nutricao-consciente-alimentando-o-corpo-alem-das-calorias",
          label: "Fome física, fome emocional e ritmo da refeição",
        },
        {
          href: "/artigos/descomplicando-a-espiritualidade-o-que-ela-tem-a-ver-com-a-sua-paz-de-espirito",
          label: "Espiritualidade como pausa no meio da rotina",
        },
      ]
    ),
    faq: [
      {
        question: "Preciso rezar ou seguir uma religião para comer com presença?",
        answer:
          "Não. O convite é prestar atenção. Quem tem uma prática de fé pode incluí-la; quem não tem, também pode só comer sem tela.",
      },
      {
        question: "Isso substitui uma alimentação variada?",
        answer:
          "Não. Dá para comer ultraprocessados com atenção e continuar com fome de nutrientes. Presença e escolha do alimento são assuntos diferentes.",
      },
      {
        question: "E se eu só tenho quinze minutos de almoço?",
        answer:
          "Use esses quinze sem tela, sentado. Uma refeição curta e presente vale mais do que alongar o tempo olhando o celular.",
      },
    ],
  },
  "hidratacao-profunda-a-agua-como-purificadora-das-celulas": {
    opening: scope(
      "Como perceber sede e incluir água no dia, sem tratar a água como detox e sem uma meta de litros válida para todo mundo."
    ),
    closing: practice(
      [
        "Deixe uma garrafa à vista na mesa de trabalho ou na cozinha. O esquecimento, mais do que a falta de vontade, costuma ser o obstáculo.",
        "Use a cor da urina como pista grosseira: amarelo-claro sugere que você está bebendo o bastante naquele período. Amarelo-escuro pede mais água, salvo orientação médica em contrário.",
        "Beba ao acordar, nas refeições e quando suar. Calor, exercício e febre mudam a necessidade. Um número fixo de litros não serve para todas as pessoas.",
        "Se um médico restringiu líquidos — por doença renal, cardíaca ou outro motivo — não aumente a água por causa deste texto.",
      ],
      "Dor de cabeça, cansaço e pele seca têm várias causas. Água pode fazer parte do cuidado e não é diagnóstico. Água não “limpa toxinas” no sentido vendido em sucos detox: rins e fígado já fazem esse trabalho quando estão saudáveis.",
      [
        {
          href: "/artigos/desintoxicacao-real-como-apoiar-o-figado-e-os-rins-naturalmente",
          label: "O que ajuda fígado e rins de verdade — e o que é mito",
        },
        {
          href: "/artigos/alimentacao-e-bem-estar-como-o-que-voce-come-molda-a-sua-saude-integral",
          label: "Como a bebida adoçada entra no lugar da água",
        },
      ],
      [{ href: GUIA, label: "Guia Alimentar para a População Brasileira — água e ultraprocessados" }]
    ),
    faq: [
      {
        question: "Todo mundo precisa beber dois litros por dia?",
        answer:
          "Não. A sede muda com clima, suor, comida e condições de saúde. Dois litros são um número popular, não uma prescrição deste portal.",
      },
      {
        question: "Água com limão desintoxica?",
        answer:
          "Não há, neste texto, essa promessa. Limão pode deixar a água mais fácil de beber. Quem tem azia ou restrição alimentar deve considerar o próprio caso.",
      },
      {
        question: "Chá e café contam?",
        answer:
          "Ajudam na ingestão de líquido, mas não precisam substituir a água. Bebidas adoçadas não são o mesmo que água.",
      },
    ],
  },
  "desintoxicacao-real-como-apoiar-o-figado-e-os-rins-naturalmente": {
    opening: scope(
      "O que significa, na prática, não sobrecarregar fígado e rins. Este texto não ensina suco detox, jejum de limpeza nem tratamento de doença hepática ou renal."
    ),
    closing: practice(
      [
        "Reduza, nesta semana, uma sobrecarga concreta: bebida alcoólica em excesso, refrigerante diário ou um ultraprocessado que entrou no automático.",
        "Durma em horário parecido por algumas noites. Órgãos não “resetam” com um suco, e o descanso faz parte do cuidado geral do corpo.",
        "Beba água ao longo do dia, salvo se existir restrição médica de líquidos.",
        "Procure serviço de saúde se houver pele ou olhos amarelados, urina muito escura, inchaço, dor forte na barriga ou no lado das costas, ou redução clara da urina.",
      ],
      "Fígado e rins saudáveis já filtram o sangue. Nenhum chá, vinagre ou suco verde substitui esse trabalho nem “elimina toxinas” acumuladas de uma vida. Ervas podem interagir com remédios. Não use chá como tratamento.",
      [
        {
          href: "/artigos/hidratacao-profunda-a-agua-como-purificadora-das-celulas",
          label: "Como beber água sem transformar isso em detox",
        },
        {
          href: "/artigos/alimentacao-e-bem-estar-como-o-que-voce-come-molda-a-sua-saude-integral",
          label: "Ultraprocessados no padrão da semana",
        },
      ],
      [
        { href: GUIA, label: "Guia Alimentar para a População Brasileira" },
        { href: OMS_DIETA, label: "Alimentação saudável — Organização Mundial da Saúde" },
      ]
    ),
    faq: [
      {
        question: "Suco verde limpa o fígado?",
        answer:
          "Não. Este portal não recomenda limpeza hepática, jejum de desintoxicação nem dose de planta para filtrar o sangue.",
      },
      {
        question: "Posso tomar chá diário para os rins?",
        answer:
          "Não comece um chá medicinal por conta própria, principalmente se você usa remédio ou tem doença renal. Água e acompanhamento médico vêm antes de receita caseira.",
      },
      {
        question: "Parar o álcool por um fim de semana desintoxica?",
        answer:
          "Reduzir álcool é um cuidado real. Não é um reset do órgão. Se parar de beber causa mal-estar intenso, procure ajuda em vez de fazer isso sozinho.",
      },
    ],
  },
  "a-conexao-intestino-cerebro-o-eixo-transmissor-da-saude-fisica": {
    opening: scope(
      "Uma explicação acessível da relação entre intestino, comida e humor. Não diagnostica intestino inflamado, não mede serotonina e não indica probiótico."
    ),
    closing: practice(
      [
        "Por três dias, anote o que você come e como se sente duas horas depois: estufamento, pressa para ir ao banheiro, dor ou só cansaço. Anotação não é diagnóstico; ajuda a conversar com um profissional.",
        "Troque um lanche de pacote por fruta, iogurte natural ou um punhado de feijão/lentilha em alguma refeição. Fibra de comida de verdade é o passo concreto.",
        "Coma sentado e sem pressa nessa refeição. Engolir rápido confunde o sinal de saciedade e deixa a experiência pior, mesmo com comida boa.",
        "Procure avaliação se houver sangue nas fezes, diarreia que não passa, perda de peso, vômito persistente ou dor que acorda você à noite.",
      ],
      "Humor ruim não prova que o intestino está “inflamado”, e prisão de ventre não prova falta de serotonina. São hipóteses que só um profissional pode investigar.",
      [
        {
          href: "/artigos/alimentacao-e-bem-estar-como-o-que-voce-come-molda-a-sua-saude-integral",
          label: "Como reduzir ultraprocessados sem dieta da moda",
        },
        {
          href: "/artigos/saude-mental-cuidando-da-mente-em-tempos-de-incerteza-e-ansiedade",
          label: "Cuidado com ansiedade, que também mexe com o corpo",
        },
      ],
      [{ href: GUIA, label: "Guia Alimentar para a População Brasileira" }]
    ),
    faq: [
      {
        question: "Preciso de um exame de microbioma?",
        answer:
          "Este texto não indica exame. Testes vendidos direto ao consumidor muitas vezes não mudam a conduta. Leve sintomas persistentes a um médico.",
      },
      {
        question: "Probiótico é obrigatório?",
        answer:
          "Não. Não há aqui marca, cepa nem prazo. Comida variada é o passo que cabe sem prescrição.",
      },
      {
        question: "Açúcar “destrói” o segundo cérebro?",
        answer:
          "A frase é forte demais. Ultraprocessados e excesso de açúcar pioram o padrão alimentar; não são uma sentença sobre o seu intestino.",
      },
    ],
  },
  "sistema-imunologico-blindado-fortalecendo-as-defesas-naturais-do-organismo": {
    opening: scope(
      "Hábitos que sustentam o corpo no dia a dia: sono, comida variada e menos esgotamento. Não existe blindagem contra vírus, e vitamina não substitui vacina nem consulta."
    ),
    closing: practice(
      [
        "Defina um horário aproximado para deitar nesta semana. Sono irregular cobra mais do corpo do que um sachê de vitamina tomado na pressa.",
        "Inclua, no prato, comida de verdade que você já alcança: feijão, ovo, fruta, legumes. Variedade importa mais do que um alimento “imunidade”.",
        "Lave as mãos com água e sabão antes de comer e depois do banheiro. É um cuidado simples e concreto.",
        "Se a febre não cede, falta ar, a tosse piora ou você tem uma doença que já pede acompanhamento, procure serviço de saúde. Não espere um chá resolver.",
      ],
      "“Blindar” a imunidade é uma metáfora, não um resultado. Ninguém fica imune a infecções por mudar o suco da manhã. Remédio e vacina, quando indicados, continuam sendo decisão de profissional e de política de saúde, não deste artigo.",
      [
        {
          href: "/artigos/como-o-sono-afeta-sua-saude-mental-e-fisica-tudo-que-voce-precisa-saber",
          label: "O que a falta de sono faz com o corpo e o humor",
        },
        {
          href: "/artigos/estresse-no-dia-a-dia-como-reconhecer-os-sinais-e-agir-antes-que-vire-um-problem",
          label: "Como reconhecer estresse antes do esgotamento",
        },
      ],
      [
        { href: OMS_DIETA, label: "Alimentação saudável — Organização Mundial da Saúde" },
        { href: GUIA, label: "Guia Alimentar para a População Brasileira" },
      ]
    ),
    faq: [
      {
        question: "Qual vitamina devo tomar para não gripar?",
        answer:
          "Nenhuma, por conta deste texto. Suplemento sem deficiência diagnosticada não é o plano daqui. A base é sono, comida variada e cuidado médico quando adoece.",
      },
      {
        question: "Intestino é o sistema imune?",
        answer:
          "O intestino participa da defesa do corpo. Isso não significa que um alimento isolado “ative” imunidade, nem que sintoma intestinal explique toda gripe.",
      },
      {
        question: "Estresse adoece?",
        answer:
          "Estresse prolongado piora sono, comida e disposição, e isso pesa na saúde. Não é uma condenação nem uma causa única de infecção.",
      },
    ],
  },
  "como-o-sono-afeta-sua-saude-mental-e-fisica-tudo-que-voce-precisa-saber": {
    opening: scope(
      "O que muda no humor, na paciência e no corpo quando o sono falta. O passo a passo para preparar o quarto e a noite está no artigo sobre o ritmo do descanso."
    ),
    closing: practice(
      [
        "Por quatro noites, anote só três coisas: hora em que deitou, hora em que levantou e como estava o humor no meio da tarde. Sem aplicativo obrigatório.",
        "Compare os dias. Se a irritação e a fome de doce acompanham as noites curtas, você já tem um dado útil — ainda não é um diagnóstico.",
        "Proteja a noite seguinte em um ponto só: menos uma hora de tela na cama, ou um horário de deitar 30 minutos mais cedo. Um ajuste, não uma reforma.",
        "Procure ajuda se o ronco vem com sonolência perigosa de dia, se a insônia dura semanas, ou se há tristeza intensa, falta de ar ou dor que impede o sono.",
      ],
      "Não existe neste texto um número de horas obrigatório para toda pessoa adulta. Necessidade muda com idade, saúde e rotina. Remédio para dormir não se começa por artigo.",
      [
        {
          href: "/artigos/o-ritmo-do-descanso-a-ciencia-e-a-arte-do-sono-reparador",
          label: "Como organizar o ambiente e o ritual da noite",
        },
        {
          href: "/artigos/saude-mental-cuidando-da-mente-em-tempos-de-incerteza-e-ansiedade",
          label: "Quando a mente acelerada atravessa o dia inteiro",
        },
      ],
      [{ href: CDC_SONO, label: "Informações públicas sobre sono — CDC" }]
    ),
    faq: [
      {
        question: "Dormir pouco engorda ou causa doença?",
        answer:
          "Noites curtas costumam piorar fome, paciência e disposição. Este texto não atribui uma doença específica à falta de sono nem promete o efeito contrário.",
      },
      {
        question: "Quantas horas eu preciso?",
        answer:
          "A maioria dos adultos se sente melhor numa faixa próxima de sete horas ou mais, mas a medida certa é individual. Sonolência que atrapalha o dia é um sinal para investigar, não para se culpar.",
      },
      {
        question: "Cochilo ajuda?",
        answer:
          "Um cochilo curto no início da tarde pode recuperar um dia ruim. Cochilos longos e tardios podem empurrar o sono da noite. Observe o que acontece com você.",
      },
    ],
  },
  "o-ritmo-do-descanso-a-ciencia-e-a-arte-do-sono-reparador": {
    opening: scope(
      "Como preparar a última hora do dia e o quarto para dormir. Os efeitos da privação de sono no humor e no corpo estão no outro artigo sobre sono."
    ),
    closing: practice(
      [
        "Escolha um horário de deitar que caiba na sua vida real e mantenha uma variação de até uma hora, inclusive no fim de semana em que der.",
        "Na última hora, troque a tela na cama por uma tarefa repetitiva: alongar o pescoço, separar a roupa do dia seguinte ou ler papel.",
        "Deixe o quarto o mais escuro e silencioso que a sua casa permitir. Se a luz da rua entra, uma cortina já muda a noite. Celular carregando fora do alcance da mão ajuda.",
        "Se não dormir em cerca de vinte minutos, levante, faça algo monótono com pouca luz e volte quando o sono aparecer. Ficar olhando o relógio aumenta a tensão.",
      ],
      "Luz, cafeína no fim do dia e horário irregular atrapalham muita gente. Isso não “destrói melatonina” como uma sentença, e não cura insônia crônica. Ronco com pausas na respiração precisa de avaliação.",
      [
        {
          href: "/artigos/como-o-sono-afeta-sua-saude-mental-e-fisica-tudo-que-voce-precisa-saber",
          label: "O que a falta de sono altera no dia seguinte",
        },
        {
          href: "/artigos/detox-digital-e-conexao-real-como-desligar-as-telas-cura-a-alma",
          label: "Como tirar a tela da última hora, sem sumir do mundo",
        },
      ],
      [{ href: CDC_SONO, label: "Informações públicas sobre sono — CDC" }]
    ),
    faq: [
      {
        question: "Preciso de um suplemento de melatonina?",
        answer:
          "Não por este texto. Hormônio e suplemento são decisão de profissional. O passo daqui é horário, escuridão e menos tela na cama.",
      },
      {
        question: "Álcool ajuda a apagar?",
        answer:
          "Pode dar sono no começo e piorar o meio da noite. Não é uma ferramenta de descanso recomendada aqui.",
      },
      {
        question: "E se eu trabalho à noite?",
        answer:
          "A lógica muda: o “quarto escuro” vale para o seu período de sono, mesmo que seja de dia. Cortina e silêncio continuam úteis. Turno noturno fixo pede orientação ocupacional quando o cansaço não cede.",
      },
    ],
  },
  "respiracao-diafragmatica-o-santo-graal-da-oxigenacao-celular": {
    opening: scope(
      "Um exercício simples de respiração mais baixa e lenta para momentos de tensão. Não oxigena células sob encomenda, não cura órgãos e não trata crise de pânico nem doença pulmonar."
    ),
    closing: practice(
      [
        "Sente-se com os pés no chão. Uma mão na barriga, outra no peito.",
        "Inspire pelo nariz contando até quatro, deixando a mão da barriga se mover mais do que a do peito. Expire devagar até seis. Repita cinco vezes.",
        "Use o exercício num gatilho real: antes de abrir o e-mail, no semáforo ou na fila. Duas vezes ao dia bastam para aprender.",
        "Pare se sentir tontura, formigamento ou falta de ar. Dor no peito, falta de ar nova ou desmaio pedem serviço de saúde, não mais repetições.",
      ],
      "Respiração lenta é uma habilidade de acalmar o corpo. Não é o “santo graal” de nada e não substitui tratamento de asma, ansiedade intensa ou problema cardíaco.",
      [
        {
          href: "/artigos/5-minutos-de-paz-tecnicas-de-relaxamento-para-quem-tem-a-mente-barulhenta",
          label: "Outras pausas curtas para mente acelerada",
        },
        {
          href: "/artigos/estresse-no-dia-a-dia-como-reconhecer-os-sinais-e-agir-antes-que-vire-um-problem",
          label: "Sinais de estresse para perceber antes da crise",
        },
      ]
    ),
    faq: [
      {
        question: "Respirar fundo cura ansiedade?",
        answer:
          "Pode reduzir a intensidade de um momento de tensão. Não cura transtorno de ansiedade nem substitui psicoterapia ou acompanhamento médico.",
      },
      {
        question: "Quantas vezes por dia?",
        answer:
          "Cinco ciclos, duas vezes ao dia, já ensinam o gesto. Mais do que isso não é melhor se você fica tonto.",
      },
      {
        question: "Preciso inspirar pela boca?",
        answer:
          "Neste exercício, o nariz é o caminho, se ele estiver livre. Nariz entupido o tempo todo merece avaliação, não força.",
      },
    ],
  },
  "5-minutos-de-paz-tecnicas-de-relaxamento-para-quem-tem-a-mente-barulhenta": {
    opening: scope(
      "Três pausas de poucos minutos para quem não consegue “esvaziar a mente”. Não é um curso de meditação e não trata insônia clínica."
    ),
    closing: practice(
      [
        "Escolha um alarme já existente — o café, o banho ou o momento de deitar — e reserve cinco minutos só para ele, sem segunda tarefa.",
        "No corpo: percorra pés, pernas, mãos, ombros e mandíbula, soltando o que estiver apertado. Pensamento que aparecer pode ficar; você só não precisa segui-lo.",
        "Se estiver na cama e a mente acelerar, sente-se, acenda uma luz baixa, anote a pendência em uma linha e volte. A cama não é mesa de planejamento.",
        "Depois de uma semana, mantenha a pausa que você de fato fez. A que só existiu na intenção pode sair.",
      ],
      "Mente barulhenta não é falha de caráter. Se a aceleração vem com pânico, tristeza que não passa ou noites em claro por semanas, o próximo passo é um profissional.",
      [
        {
          href: "/artigos/respiracao-diafragmatica-o-santo-graal-da-oxigenacao-celular",
          label: "A pausa de respiração, com limite claro do que ela faz",
        },
        {
          href: "/artigos/o-ritmo-do-descanso-a-ciencia-e-a-arte-do-sono-reparador",
          label: "Como a última hora do dia ajuda o sono",
        },
      ],
      [{ href: OMS_MENTE, label: "Saúde mental — Organização Mundial da Saúde" }]
    ),
    faq: [
      {
        question: "Eu falhei se continuar pensando?",
        answer:
          "Não. O exercício é notar e voltar, não apagar o pensamento. Quem espera silêncio total desiste no segundo minuto.",
      },
      {
        question: "Banho consciente substitui sono?",
        answer:
          "Não. Ele pode marcar o fim do expediente mental. Dormir continua dependendo de horário, escuridão e saúde.",
      },
      {
        question: "Serve para crise de ansiedade?",
        answer:
          "Pode ser um apoio no meio do episódio. Crises frequentes, falta de ar ou medo intenso pedem cuidado profissional, não só uma técnica de cinco minutos.",
      },
    ],
  },
  "estresse-no-dia-a-dia-como-reconhecer-os-sinais-e-agir-antes-que-vire-um-problem": {
    opening: scope(
      "Como reconhecer sinais cotidianos de estresse — corpo, sono, paciência — e o que fazer na mesma semana. Não mede cortisol e não diagnostica burnout."
    ),
    closing: practice(
      [
        "Marque, ao fim do dia, um sinal que apareceu: mandíbula travada, fome de doce à noite, esquecimento, irritação curta ou acordar já cansado.",
        "Escolha o sinal mais repetido e um corte pequeno: sair da mesa a cada hora, não responder mensagem de trabalho depois de um horário, ou deitar trinta minutos mais cedo.",
        "Avise uma pessoa da casa ou do trabalho sobre esse corte. Limite combinado dura mais do que limite só pensado.",
        "Se o cansaço vem com tristeza persistente, dor no peito, falta de ar ou você não consegue trabalhar nem descansar, procure serviço de saúde. Estresse não é nome para todo sofrimento.",
      ],
      "Cortisol alto não se confirma por artigo, aplicativo ou “sensação de bomba-relógio”. Exame e diagnóstico ficam com o profissional. O que você pode fazer hoje é reduzir um gatilho e recuperar sono.",
      [
        {
          href: "/artigos/aprendendo-a-dizer-nao-o-limite-que-protege-a-sua-paz-interior",
          label: "Como dizer não sem transformar isso em culpa",
        },
        {
          href: "/artigos/5-minutos-de-paz-tecnicas-de-relaxamento-para-quem-tem-a-mente-barulhenta",
          label: "Pausas curtas para quando a mente não desliga",
        },
      ],
      [{ href: OMS_MENTE, label: "Saúde mental — Organização Mundial da Saúde" }]
    ),
    faq: [
      {
        question: "Estresse e ansiedade são a mesma coisa?",
        answer:
          "Não. Estresse costuma ter um pressionamento identificável: prazo, cuidado com alguém, dinheiro, sono. Ansiedade pode continuar mesmo sem o prazo. Os dois podem coexistir e os dois merecem cuidado quando atrapalham a vida.",
      },
      {
        question: "Preciso de um exame de cortisol?",
        answer:
          "Não por este texto. Sintoma leve de rotina se observa e se ajusta. Sintoma forte se leva ao médico, que decide se há exame.",
      },
      {
        question: "Um fim de semana resolve?",
        answer:
          "Descansar ajuda. Se na segunda o corpo volta ao mesmo ponto, o problema está na carga da semana, não na falta de um passeio.",
      },
    ],
  },
  "saude-mental-cuidando-da-mente-em-tempos-de-incerteza-e-ansiedade": {
    opening: scope(
      "Como cuidar da mente em semanas incertas: o que observar, o que reduzir e quando pedir ajuda. Não é terapia e não ensina a eliminar a ansiedade."
    ),
    closing: practice(
      [
        "Separe o que está no seu alcance nesta semana (uma conversa, uma conta, um horário de sono) do que você só consegue acompanhar (notícia, decisão de outras pessoas).",
        "Escolha dois horários para olhar notícias. Fora deles, o aplicativo pode sair da primeira tela do celular.",
        "Combine uma âncora diária de dez minutos que não seja produção: caminhar até a esquina, comer sem tela ou alongar o pescoço.",
        "Peça ajuda se o medo impede trabalho ou sono, se há pânico, pensamento de não querer viver, ou uso de álcool para aguentar o dia. No Brasil, o CVV atende em ligação 188, 24 horas, de graça.",
      ],
      "Incerteza faz parte da vida. Sofrimento que toma os dias não é “frescura” nem falta de fé. Acolhimento profissional existe para isso. Este portal não substitui esse cuidado.",
      [
        {
          href: "/artigos/estresse-no-dia-a-dia-como-reconhecer-os-sinais-e-agir-antes-que-vire-um-problem",
          label: "Sinais de estresse para agir cedo",
        },
        {
          href: "/artigos/detox-digital-e-conexao-real-como-desligar-as-telas-cura-a-alma",
          label: "Como diminuir a tela sem sumir das pessoas",
        },
      ],
      [{ href: OMS_MENTE, label: "Saúde mental — Organização Mundial da Saúde" }]
    ),
    faq: [
      {
        question: "Ansiedade se resolve com força de vontade?",
        answer:
          "Não. Dá para reduzir gatilhos e pedir ajuda. Tratar como falha moral atrasa o cuidado.",
      },
      {
        question: "Devo parar de ver notícias?",
        answer:
          "Não é obrigatório. Limitar horários costuma ser mais sustentável do que desaparecer e voltar em overdose de informação.",
      },
      {
        question: "Quando a preocupação vira um problema?",
        answer:
          "Quando ela toma horas, tira o sono, impede decisões simples ou vem com sintomas físicos fortes. Esse é o momento de procurar um profissional, não de acumular mais dicas.",
      },
    ],
  },
  "atividade-fisica-na-rotina-o-guia-pratico-para-quem-nao-tem-tempo": {
    opening: scope(
      "Como encaixar movimento numa agenda cheia, em blocos curtos. Não é um treino, não prescreve série e não trata lesão."
    ),
    closing: practice(
      [
        "Olhe a agenda de amanhã e marque dois blocos de dez minutos que já existem: o caminho até o ponto, a escada do trabalho, o intervalo do almoço.",
        "Nesses blocos, caminhe ou suba escada em ritmo em que você ainda consegue falar uma frase. Isso já conta como movimento.",
        "Deixe o tênis ou a roupa à vista na noite anterior. A decisão fica feita antes do cansaço da manhã.",
        "Se houver dor no peito, tontura, falta de ar desproporcional ou uma lesão atual, pare e procure avaliação antes de aumentar o ritmo.",
      ],
      "A Organização Mundial da Saúde fala em atividade ao longo da semana para adultos, incluindo quem começa pouco. Este texto não transforma isso em meta pessoal nem em promessa de emagrecimento.",
      [
        {
          href: "/artigos/movimento-intuitivo-exercitando-se-por-gratidao-nao-por-punicao",
          label: "Como escolher um movimento que você não odeia",
        },
        {
          href: "/artigos/longevidade-saudavel-habitos-atuais-que-protegem-suas-articulacoes-no-futuro",
          label: "Como cuidar de joelho e coluna enquanto você se mexe",
        },
      ],
      [{ href: OMS_ATIVIDADE, label: "Atividade física — Organização Mundial da Saúde" }]
    ),
    faq: [
      {
        question: "Dez minutos servem para alguma coisa?",
        answer:
          "Servem para sair do zero e criar o hábito. Quem já treina pode precisar de mais. Quem não faz nada ganha ao começar curto e repetir.",
      },
      {
        question: "Preciso suar e sentir dor?",
        answer:
          "Não. Dor não é medida de treino neste texto. Cansaço leve que passa é diferente de dor aguda.",
      },
      {
        question: "E se eu não tenho onde caminhar com segurança?",
        answer:
          "Use o espaço que existe: corredor, escada, levantar da cadeira a cada hora, um vídeo curto em casa. O lugar perfeito não pode ser a condição para começar.",
      },
    ],
  },
  "movimento-intuitivo-exercitando-se-por-gratidao-nao-por-punicao": {
    opening: scope(
      "Como trocar a relação de castigo com o exercício por uma escolha que caiba no seu corpo. O encaixe na agenda curta está no guia para quem não tem tempo."
    ),
    closing: practice(
      [
        "Liste três movimentos que você já gostou algum dia, mesmo na infância: dançar, bola, bicicleta, horta, caminhar com alguém, nadar.",
        "Experimente um deles por vinte minutos nesta semana, sem foto, sem meta de caloria e sem comparar com outra pessoa.",
        "No fim, anote uma frase: “meu corpo conseguiu…” com algo concreto, como subir a rua ou ficar menos travado no ombro.",
        "Abandone a modalidade que você só mantém por vergonha. Consistência vem do que você repete, não do que parece mais disciplinado.",
      ],
      "Gostar do movimento não dispensa progresso nem cuidado com dor. Lesão, gestação, doença cardíaca e retorno depois de muito tempo parado pedem orientação presencial.",
      [
        {
          href: "/artigos/atividade-fisica-na-rotina-o-guia-pratico-para-quem-nao-tem-tempo",
          label: "Como achar dez minutos numa agenda cheia",
        },
        {
          href: "/artigos/o-templo-fisico-como-a-postura-diaria-afeta-sua-energia-vital",
          label: "O que a cadeira faz com a coluna ao longo do dia",
        },
      ],
      [{ href: OMS_ATIVIDADE, label: "Atividade física — Organização Mundial da Saúde" }]
    ),
    faq: [
      {
        question: "Se eu só faço o que gosto, nunca vou evoluir?",
        answer:
          "Evoluir é repetir. Quem odeia o treino falta. Dá para gostar da atividade e ainda assim aumentar o tempo aos poucos.",
      },
      {
        question: "Caminhada conta como exercício?",
        answer:
          "Conta como movimento, sim. Para muita gente é a base mais sustentável. Intensidade e objetivo mudam de pessoa para pessoa.",
      },
      {
        question: "Posso treinar para compensar o que comi?",
        answer:
          "Esse é o ciclo de punição que este texto quer interromper. Comida e movimento são cuidados diferentes, não uma dívida.",
      },
    ],
  },
  "o-templo-fisico-como-a-postura-diaria-afeta-sua-energia-vital": {
    opening: scope(
      "O que a cadeira e a tela fazem com pescoço, ombros e fôlego ao longo do expediente, e o que mudar em dois minutos. Não é fisioterapia nem leitura da NR-01 no lugar da norma oficial."
    ),
    closing: practice(
      [
        "Ajuste a tela para a altura dos olhos e aproxime a cadeira, para não esticar o pescoço para a frente o dia inteiro.",
        "A cada hora, levante, olhe para um ponto distante e solte os ombros. Um alarme curto basta.",
        "Sente-se com os dois pés no chão e o apoio da lombar encostado. Se a cadeira não tem apoio, uma toalha enrolada atrás da cintura já muda o ângulo.",
        "Dor que irradia para o braço, formigamento, perda de força ou dor depois de uma queda pedem avaliação. Alongar no escritório não trata hérnia nem lesão.",
      ],
      "Normas de trabalho mudam. Se o seu caso é risco ocupacional, consulte o texto vigente da NR-01 e o serviço de segurança da empresa, não só este artigo. Postura melhor não “aumenta energia vital” como promessa; ela reduz um desconforto evitável.",
      [
        {
          href: "/artigos/respiracao-diafragmatica-o-santo-graal-da-oxigenacao-celular",
          label: "Como soltar a respiração quando o peito fica curto",
        },
        {
          href: "/artigos/atividade-fisica-na-rotina-o-guia-pratico-para-quem-nao-tem-tempo",
          label: "Como sair da cadeira mesmo com a agenda cheia",
        },
      ]
    ),
    faq: [
      {
        question: "Existe postura perfeita?",
        answer:
          "Não. O que cansa é ficar horas na mesma posição. Variar e apoiar a lombar ajuda mais do que um ângulo rígido.",
      },
      {
        question: "Colchão e cadeira caros resolvem?",
        answer:
          "Não necessariamente. Primeiro ajuste altura da tela, pausas e o jeito de sentar. Equipamento novo sem pausa repete o mesmo hábito.",
      },
      {
        question: "Posso fazer os exercícios da cadeira com dor?",
        answer:
          "Não force amplitude se houver dor aguda. Movimento leve sem dor é diferente de insistir num exercício que piora o sintoma.",
      },
    ],
  },
  "longevidade-saudavel-habitos-atuais-que-protegem-suas-articulacoes-no-futuro": {
    opening: scope(
      "Hábitos de hoje que poupam joelho, quadril e coluna: força simples, pausa da cadeira e calçado do dia a dia. Não prescreve colágeno nem trata artrose."
    ),
    closing: practice(
      [
        "Se você passa o dia sentado, levante a cada hora. O joelho sofre tanto com a imobilidade quanto com o impacto mal dosado.",
        "Duas vezes por semana, faça um movimento de força que você já domina com segurança: sentar e levantar da cadeira, carregar a compra em postura estável ou uma faixa elástica leve. Pare antes da dor.",
        "Troque o salto alto ou o chinelo solto em trajetos longos por um calçado que prenda o pé. O chão irregular cobra o tornozelo.",
        "Inchaço, joelho que falseia, dor noturna ou depois de um entorse pedem avaliação. Suplemento não corrige lesão.",
      ],
      "Colágeno em pó não é o plano deste texto. Músculo e movimento orientados protegem a articulação melhor do que uma promessa de cápsula. Quem já tem diagnóstico deve seguir o profissional que acompanha o caso.",
      [
        {
          href: "/artigos/o-templo-fisico-como-a-postura-diaria-afeta-sua-energia-vital",
          label: "Como a cadeira cobra a coluna no expediente",
        },
        {
          href: "/artigos/longevidade-o-segredo-para-uma-vida-longa-e-saudavel",
          label: "Outros hábitos de uma vida longa, além da articulação",
        },
      ],
      [{ href: OMS_ATIVIDADE, label: "Atividade física — Organização Mundial da Saúde" }]
    ),
    faq: [
      {
        question: "Corrida desgasta o joelho?",
        answer:
          "Depende de volume, calçado, piso e do joelho de quem corre. Este texto não proíbe corrida nem a receita. Dor nova é motivo para avaliar, não para concluir sozinho.",
      },
      {
        question: "Preciso de suplemento de colágeno?",
        answer:
          "Não por este artigo. Comida variada e força muscular são os passos concretos daqui.",
      },
      {
        question: "Alongar substitui fortalecer?",
        answer:
          "Não. Mobilidade e força se complementam. Só alongar, se você passa o dia sentado e nunca fortalece, deixa a articulação sem o apoio do músculo.",
      },
    ],
  },
  "longevidade-o-segredo-para-uma-vida-longa-e-saudavel": {
    opening: scope(
      "Quais hábitos do cotidiano têm relação com envelhecer com mais autonomia: movimento, pessoas, comida simples e um motivo para levantar. Não promete chegar aos cem anos nem resume as Blue Zones como fórmula."
    ),
    closing: practice(
      [
        "Escolha um hábito que você controla nesta semana: caminhar depois do almoço, cozinhar feijão, ou marcar uma conversa presencial.",
        "Mantenha força mínima: levantar da cadeira sem impulso das mãos, se isso for seguro para você, algumas vezes por semana.",
        "Nomeie uma tarefa da semana que não é obrigação vazia — cuidar de uma planta, de alguém, de um ofício. Propósito aqui é concreto, não frase de efeito.",
        "Leve ao médico o que você vem adiando: pressão, sono que não restaura, falta de ar, queda. Longevidade sem acompanhamento é só discurso.",
      ],
      "Regiões famosas por muita gente idosa inspiram perguntas, não uma receita. Genética, renda, acesso a saúde e sorte também pesam. Nenhum hábito daqui garante idade.",
      [
        {
          href: "/artigos/longevidade-saudavel-habitos-atuais-que-protegem-suas-articulacoes-no-futuro",
          label: "Como poupar as articulações a partir de agora",
        },
        {
          href: "/artigos/relacoes-saudaveis-como-a-comunicacao-constroi-o-bem-estar",
          label: "Por que os vínculos entram nesse cuidado",
        },
      ],
      [
        { href: OMS_ATIVIDADE, label: "Atividade física — Organização Mundial da Saúde" },
        { href: GUIA, label: "Guia Alimentar para a População Brasileira" },
      ]
    ),
    faq: [
      {
        question: "As Blue Zones provam um método?",
        answer:
          "Elas são um recorte popular de lugares onde muita gente envelhece. Não são um protocolo clínico e não cabem inteiras na vida de quem mora em outra cidade, com outro trabalho e outro acesso a saúde.",
      },
      {
        question: "Existe um segredo único?",
        answer:
          "Não. O título usa a palavra no sentido de curiosidade. O que se repete nos cuidados sérios é sono, movimento, comida de verdade, vínculos e tratar doença cedo.",
      },
      {
        question: "Musculação é obrigatória?",
        answer:
          "Força muscular importa na autonomia. A forma — peso, faixa, peso do corpo — depende da sua condição. Dor e doença cardíaca pedem orientação antes de carga.",
      },
    ],
  },
  "o-que-e-bem-estar-entenda-o-conceito-e-por-que-ele-importa": {
    opening: scope(
      "O que este portal chama de bem-estar: corpo, mente e relações no mesmo dia, sem transformar a vida num projeto de perfeição."
    ),
    closing: practice(
      [
        "Escolha um incômodo real desta semana, não uma meta de “vida nova”. Exemplo: dormir mal, almoçar em pé, ou não falar com ninguém.",
        "Ligue esse incômodo a uma página específica do portal, em vez de tentar aplicar dez hábitos ao mesmo tempo.",
        "Defina um sinal de que a semana foi boa o bastante: deitar em horário parecido três noites, ou uma refeição sem tela. “O bastante” é o critério.",
        "Se o incômodo for tristeza persistente, dor ou falta de ar, o bem-estar deixa de ser conteúdo e passa a ser consulta.",
      ],
      "Bem-estar não é humor alto o tempo todo nem produtividade disfarçada. É conseguir comer, dormir, se mover e conviver com menos desgaste evitável.",
      [
        {
          href: "/artigos/a-importancia-de-criar-uma-rotina-de-bem-estar-sustentavel",
          label: "Como montar uma rotina que sobrevive à semana cheia",
        },
        {
          href: "/artigos/autocuidado-na-pratica-10-habitos-simples-para-transformar-sua-rotina",
          label: "Hábitos pequenos, um de cada vez",
        },
      ]
    ),
    faq: [
      {
        question: "Bem-estar é o mesmo que saúde?",
        answer:
          "Não. Saúde inclui diagnósticos e cuidados profissionais. Bem-estar, aqui, é a qualidade do dia a dia. Os dois se conversam e nenhum substitui o outro.",
      },
      {
        question: "Preciso cuidar de corpo, mente e espírito juntos?",
        answer:
          "Não no mesmo dia. Escolha a ponta que está doendo. O portal separa os temas para você não misturar tudo numa obrigação só.",
      },
      {
        question: "Por onde começo se estou sobrecarregado?",
        answer:
          "Pelo sono ou por uma refeição sentado. São as duas portas que mais destravam o resto, e as duas cabem sem equipamento.",
      },
    ],
  },
  "a-importancia-de-criar-uma-rotina-de-bem-estar-sustentavel": {
    opening: scope(
      "Como manter um cuidado pequeno em semanas imperfeitas. Não é uma lista de dez hábitos nem um desafio de trinta dias."
    ),
    closing: practice(
      [
        "Escreva um hábito mínimo que ainda acontece no seu pior dia: beber um copo de água ao acordar, ou deitar sem tela. Se ele depende de tempo sobrando, está grande demais.",
        "Amarre esse hábito a algo que já existe: a chaleira, a escovação, o fechamento do notebook.",
        "Quando falhar um dia, volte no seguinte sem compensar em dobro. Compensação é o que torna a rotina frágil.",
        "Revise no domingo em duas linhas: o que ficou de pé e o que era fantasia de agenda. Risque a fantasia.",
      ],
      "Rotina sustentável é chata de propósito. Ela não precisa render foto nem sequência perfeita. Se o cuidado virou mais uma cobrança, ele deixou de cuidar.",
      [
        {
          href: "/artigos/autocuidado-na-pratica-10-habitos-simples-para-transformar-sua-rotina",
          label: "Um cardápio de hábitos para escolher um, não os dez",
        },
        {
          href: "/artigos/o-que-e-bem-estar-entenda-o-conceito-e-por-que-ele-importa",
          label: "O que bem-estar significa neste portal",
        },
      ]
    ),
    faq: [
      {
        question: "Quantos hábitos devo ter?",
        answer:
          "Um que sobrevive à semana cheia. O segundo só entra quando o primeiro já acontece sem negociação diária.",
      },
      {
        question: "Falhar dois dias zera o processo?",
        answer:
          "Não. Zera quem transforma o erro em prova de que “não leva jeito” e abandona. Voltar no dia seguinte é o método.",
      },
      {
        question: "Manhã perfeita é obrigatória?",
        answer:
          "Não. Quem acorda com criança, turno ou dor não cabe num ritual de uma hora. O mínimo cabe.",
      },
    ],
  },
  "autocuidado-na-pratica-10-habitos-simples-para-transformar-sua-rotina": {
    opening: scope(
      "Como escolher um hábito de autocuidado e encaixá-lo, em vez de colecionar dez. A montagem da rotina que não quebra está no artigo sobre sustentabilidade."
    ),
    closing: practice(
      [
        "Leia a lista de hábitos do texto e circule só um que resolve um incômodo desta semana: sono, fome no meio da tarde, ou ombro travado.",
        "Faça esse hábito no mesmo contexto por cinco dias. Contexto fixo vence motivação.",
        "Conte a alguém ou deixe um lembrete físico. Autocuidado secreto demais some na primeira urgência do trabalho.",
        "Não some os outros nove no fim de semana para “compensar”. Isso transforma cuidado em dívida.",
      ],
      "Autocuidado não é spa nem isolamento. Inclui limite no trabalho e pedir ajuda. Se você está esgotado a ponto de não conseguir o mínimo, o passo é descanso e, se preciso, profissional — não mais uma lista.",
      [
        {
          href: "/artigos/a-importancia-de-criar-uma-rotina-de-bem-estar-sustentavel",
          label: "Como manter o hábito quando a semana desanda",
        },
        {
          href: "/artigos/aprendendo-a-dizer-nao-o-limite-que-protege-a-sua-paz-interior",
          label: "O limite que protege o tempo desse cuidado",
        },
      ]
    ),
    faq: [
      {
        question: "Autocuidado é egoísmo?",
        answer:
          "Não, quando ele permite que você continue presente. Sumir das responsabilidades sem conversar é outro assunto. Dormir e comer não são luxo.",
      },
      {
        question: "Preciso fazer os dez hábitos?",
        answer:
          "Não. Dez é um cardápio. Um hábito repetido muda mais do que dez experimentados uma vez.",
      },
      {
        question: "E no trabalho, o que cabe?",
        answer:
          "Uma pausa real para comer e um horário para parar de responder. O resto da lista pode esperar.",
      },
    ],
  },
  "aprendendo-a-dizer-nao-o-limite-que-protege-a-sua-paz-interior": {
    opening: scope(
      "Como recusar um pedido sem sumir da relação. A escuta e o reparo da conversa estão no artigo sobre relações saudáveis."
    ),
    closing: practice(
      [
        "Antes de responder um convite, espere dez minutos. A pressa de agradar decide no automático.",
        "Use uma frase curta e completa: “Não vou conseguir neste dia”. Sem romance longo de desculpa, a menos que você queira explicar.",
        "Ofereça alternativa só se ela for verdadeira. “Não posso hoje” não precisa virar “então eu faço no seu lugar amanhã”.",
        "Repare no corpo depois do não: ombro, mandíbula, culpa. Culpa não significa que a decisão foi errada; significa que o hábito antigo ainda fala.",
      ],
      "Dizer não não autoriza grosseria nem abandono de quem depende de você de verdade, como uma criança ou um cuidado combinado. Limite é clareza, não sumiço.",
      [
        {
          href: "/artigos/relacoes-saudaveis-como-a-comunicacao-constroi-o-bem-estar",
          label: "Como escutar e falar sem transformar tudo em disputa",
        },
        {
          href: "/artigos/estresse-no-dia-a-dia-como-reconhecer-os-sinais-e-agir-antes-que-vire-um-problem",
          label: "Sinais de que a agenda já passou do limite",
        },
      ]
    ),
    faq: [
      {
        question: "Dizer não vai estragar a relação?",
        answer:
          "Uma recusa clara costuma estragar menos do que um sim ressentido. Se a relação só existe quando você aceita tudo, o problema não é a frase.",
      },
      {
        question: "E se a pessoa insistir?",
        answer:
          "Repita a mesma frase, sem acrescentar defesa nova. Insistência não cria obrigação.",
      },
      {
        question: "Preciso explicar o motivo?",
        answer:
          "Não sempre. Motivo verdadeiro pode aproximar. Motivo inventado vira armadilha quando a pessoa cobra o detalhe.",
      },
    ],
  },
  "relacoes-saudaveis-como-a-comunicacao-constroi-o-bem-estar": {
    opening: scope(
      "Como escutar e falar de um assunto difícil sem ganhar a discussão. O gesto específico de recusar pedidos está no texto sobre dizer não."
    ),
    closing: practice(
      [
        "Numa conversa desta semana, espere a pessoa terminar a frase antes de preparar a sua. Se precisar, repita o que entendeu em uma linha: “você está dizendo que…”.",
        "Troque acusação por fato: “quando a mensagem chegou às onze, eu já estava na cama” em vez de “você não me respeita”.",
        "Peça uma coisa só. Conversas que cobram o mês inteiro não cabem numa noite.",
        "Se houver medo, controle, humilhação ou violência, o passo não é uma técnica de comunicação. Procure uma pessoa de confiança e, se estiver em risco, a rede de proteção da sua cidade ou a Central de Atendimento à Mulher, 180.",
      ],
      "Relação boa não é ausência de conflito. É conflito sem humilhação, com chance de reparo. Técnica de fala não conserta abuso.",
      [
        {
          href: "/artigos/aprendendo-a-dizer-nao-o-limite-que-protege-a-sua-paz-interior",
          label: "Como recusar sem ensaiar um discurso",
        },
        {
          href: "/artigos/o-poder-do-perdao-no-dia-a-dia-tirando-o-carvao-aceso-das-proprias-maos",
          label: "O que perdão é — e o que ele não obriga você a aceitar",
        },
      ]
    ),
    faq: [
      {
        question: "Comunicação não violenta resolve briga de casal?",
        answer:
          "Ela ajuda a falar com menos ataque. Não substitui acordo, limite nem ajuda profissional quando o padrão é repetido e doloroso.",
      },
      {
        question: "Devo responder na hora da mensagem?",
        answer:
          "Não, se o assunto é sério. Mensagem quente à noite costuma piorar. Combine um horário para falar, se for seguro fazer isso.",
      },
      {
        question: "Relação tóxica adoece o corpo?",
        answer:
          "Conflito contínuo piora sono e tensão. Isso não é um diagnóstico. Se você tem medo na relação, priorize segurança, não uma metáfora biológica.",
      },
    ],
  },
  "o-diario-da-gratidao-como-um-caderno-simples-pode-mudar-sua-vibracao": {
    opening: scope(
      "Como usar um caderno de três linhas para notar o que já aconteceu no dia. Não promete mudar vibração, atrair nada nem tratar depressão."
    ),
    closing: practice(
      [
        "Deixe um papel e uma caneta onde você já senta à noite. Aplicativo novo é fricção desnecessária.",
        "Escreva três fatos pequenos e verdadeiros do dia: o café saiu quente, alguém segurou a porta, a criança dormiu. Fato, não frase pronta.",
        "Se o dia foi ruim, escreva um fato neutro. Não invente gratidão. Forçar positivo em dia de luto ou crise é desonesto com você.",
        "Releia no fim da semana só para ver o que se repete. Isso mostra o que sustenta a sua rotina, sem virar cobrança.",
      ],
      "Gratidão não apaga conta atrasada, doença ou relação ruim. Ela é um exercício de atenção. Se a vida está sem cor por semanas, o caderno não substitui cuidado em saúde mental.",
      [
        {
          href: "/artigos/gentileza-gera-saude-como-ajudar-o-outro-acalma-o-seu-proprio-coracao",
          label: "O gesto com outra pessoa, que é diferente de anotar sozinho",
        },
        {
          href: "/artigos/saude-mental-cuidando-da-mente-em-tempos-de-incerteza-e-ansiedade",
          label: "Quando a tristeza ou a ansiedade pedem mais do que um hábito",
        },
      ]
    ),
    faq: [
      {
        question: "Preciso escrever todos os dias?",
        answer:
          "Não. Três noites por semana já criam o gesto. Diário perfeito que você abandona não vale mais do que um caderno irregular que continua.",
      },
      {
        question: "E se eu não sinto gratidão?",
        answer:
          "Anote o fato mesmo assim, sem a palavra gratidão. Sentir pode vir depois, ou não. O exercício é perceber, não performar.",
      },
      {
        question: "Isso melhora a saúde?",
        answer:
          "Pode ajudar a dormir com menos ruminação, para algumas pessoas. Não é tratamento e não há, neste texto, promessa de efeito clínico.",
      },
    ],
  },
  "gentileza-gera-saude-como-ajudar-o-outro-acalma-o-seu-proprio-coracao": {
    opening: scope(
      "Como um gesto concreto de cuidado com outra pessoa pode organizar o seu próprio dia. Não afirma que gentileza cura o coração nem mede hormônio."
    ),
    closing: practice(
      [
        "Escolha um gesto que cabe em dez minutos e não te endivida: mandar uma informação útil, segurar uma fila, ou elogiar um trabalho específico que você viu.",
        "O elogio precisa ser verificável. “Você entregou o relatório antes do prazo” é melhor do que “você é incrível”.",
        "Não publique o gesto. O efeito que interessa é a relação, não a plateia.",
        "Se ajudar os outros é o único jeito de você se sentir válido, pare e olhe o seu descanso. Gentileza contínua sem limite vira esgotamento, não saúde.",
      ],
      "Ajudar não trata depressão, pressão alta nem solidão profunda. Pode aproximar pessoas. Se você está isolado e triste há semanas, peça cuidado para si, não só ofereça cuidado.",
      [
        {
          href: "/artigos/o-diario-da-gratidao-como-um-caderno-simples-pode-mudar-sua-vibracao",
          label: "O exercício de notar o dia, feito sozinho",
        },
        {
          href: "/artigos/relacoes-saudaveis-como-a-comunicacao-constroi-o-bem-estar",
          label: "Como a conversa sustenta o gesto de cuidado",
        },
      ]
    ),
    faq: [
      {
        question: "Gentileza baixe a pressão ou o cortisol?",
        answer:
          "Este texto não afirma isso. Não há exame nem número aqui. O que dá para observar é se o gesto diminuiu a pressa daquele momento.",
      },
      {
        question: "Preciso ajudar desconhecidos?",
        answer:
          "Não. Cuidar de quem já está na sua casa ou no seu trabalho, com clareza, já é o exercício.",
      },
      {
        question: "E se a pessoa não agradecer?",
        answer:
          "O gesto não é um contrato. Se você só consegue oferecer o que será aplaudido, escolha um gesto menor e mais honesto.",
      },
    ],
  },
  "o-poder-do-perdao-no-dia-a-dia-tirando-o-carvao-aceso-das-proprias-maos": {
    opening: scope(
      "Como distinguir perdão de reconciliação, e o que fazer com uma mágoa que ainda ocupa o dia. Não é terapia, não obriga contato e não apresenta o Ho'oponopono como tratamento."
    ),
    closing: practice(
      [
        "Escreva o fato em três linhas: o que aconteceu, o que você perdeu e o que você ainda precisa para se sentir seguro. Sem enviar a ninguém.",
        "Decida uma coisa separada da outra: você pode soltar o ensaio mental da briga e, ao mesmo tempo, não voltar a ficar a sós com essa pessoa.",
        "Se usar uma frase de perdão, use em silêncio e como intenção sua. Não é fórmula que apaga o ocorrido nem substitui pedido de desculpas de quem errou.",
        "Procure ajuda se a mágoa vem com medo, vigilância, pesadelo ou você não consegue trabalhar. Perdão não é o primeiro passo em situação de violência.",
      ],
      "Perdão, aqui, é deixar de carregar o episódio o dia inteiro. Não é esquecer, não é aceitar de novo e não é dispensar consequência. Quem causou dano continua responsável por ele.",
      [
        {
          href: "/artigos/relacoes-saudaveis-como-a-comunicacao-constroi-o-bem-estar",
          label: "Como conversar quando ainda existe segurança para isso",
        },
        {
          href: "/artigos/aprendendo-a-dizer-nao-o-limite-que-protege-a-sua-paz-interior",
          label: "O limite que continua valendo depois do perdão",
        },
      ]
    ),
    faq: [
      {
        question: "Perdoar exige voltar a conviver?",
        answer:
          "Não. Reconciliação é outra decisão e depende de segurança e de mudança de quem errou. Dá para seguir a vida sem reabrir a porta.",
      },
      {
        question: "Ho'oponopono funciona?",
        answer:
          "É uma prática de intenção, não um método clínico. Use só se fizer sentido para você. Não substitui conversa, justiça ou terapia.",
      },
      {
        question: "Guardar mágoa adoece?",
        answer:
          "Ruminação atrapalha sono e descanso. Isso não significa que a doença que você tem foi causada pela mágoa, nem que perdoar seja o tratamento.",
      },
    ],
  },
  "descomplicando-a-espiritualidade-o-que-ela-tem-a-ver-com-a-sua-paz-de-espirito": {
    opening: scope(
      "Uma porta simples para espiritualidade no cotidiano: três minutos de silêncio, sem dogma e sem promessa de paz permanente."
    ),
    closing: practice(
      [
        "Escolha um minuto já ocupado — a água do café ou o banco do ônibus — e fique nele sem fone.",
        "Se quiser alongar para três minutos, sente-se e conte cinco expirações. Pensamento pode entrar. Volte à contagem.",
        "Não acrescente crença que não é sua. O exercício é a pausa. Quem tem fé pode nomeá-la; quem não tem, não precisa inventar.",
        "Se o silêncio aumentar a angústia em vez de organizá-la, encurte e procure companhia ou ajuda profissional. Silêncio não é prova para todo mundo.",
      ],
      "Espiritualidade, neste portal, não é produto, não prevê o futuro e não substitui cuidado de saúde. Paz de espírito aqui significa um pouco menos de pressa, não um estado permanente.",
      [
        {
          href: "/artigos/pe-na-terra-como-o-contato-com-a-natureza-limpa-a-nossa-energia",
          label: "A pausa do lado de fora de casa",
        },
        {
          href: "/artigos/5-minutos-de-paz-tecnicas-de-relaxamento-para-quem-tem-a-mente-barulhenta",
          label: "Quando a mente não colabora com o silêncio",
        },
      ]
    ),
    faq: [
      {
        question: "Preciso meditar como um monge?",
        answer:
          "Não. Três minutos sem fone já são o hábito. Aumentar o tempo só faz sentido se você quiser e se o silêncio não te deixar pior.",
      },
      {
        question: "Isso conflita com a minha religião?",
        answer:
          "Não deveria. É uma pausa. Se a sua tradição tem um horário de oração, use esse horário em vez de criar outro.",
      },
      {
        question: "Por que eu continuo ansioso depois?",
        answer:
          "Porque uma pausa não apaga a causa da ansiedade. Ela só impede que o dia inteiro seja no mesmo ritmo. Se a ansiedade manda na semana, procure cuidado.",
      },
    ],
  },
  "pe-na-terra-como-o-contato-com-a-natureza-limpa-a-nossa-energia": {
    opening: scope(
      "Como passar alguns minutos em contato com algo vivo — árvore, terra, céu — quando o dia foi só concreto. Não afirma que a natureza “suga energia negativa” nem trata doença."
    ),
    closing: practice(
      [
        "Ache o verde mais próximo que seja seguro: praça, quintal, vaso na janela ou uma árvore no caminho do trabalho.",
        "Fique dois minutos sem fone. Olhe uma coisa só: folha, nuvem ou o chão. Não precisa descalçar o pé se o lugar não for limpo.",
        "Se não puder sair, abra a janela e repita o mesmo olhar. Visualizar uma floresta não substitui o ar livre, mas quebra o dia trancado.",
        "Volte para dentro e faça a próxima tarefa. A pausa não precisa virar um passeio para contar.",
      ],
      "Cansaço que o sono não resolve pode ser estresse, anemia, apneia ou tristeza. Natureza pode arejar o dia e não é diagnóstico. Não caminhe sozinho em lugar inseguro só para cumprir o exercício.",
      [
        {
          href: "/artigos/criando-o-seu-santuario-em-casa-passos-simples-para-um-cantinho-de-paz",
          label: "Como fazer uma pausa dentro de casa",
        },
        {
          href: "/artigos/detox-digital-e-conexao-real-como-desligar-as-telas-cura-a-alma",
          label: "Como tirar a tela desse intervalo",
        },
      ]
    ),
    faq: [
      {
        question: "Preciso andar descalço na grama?",
        answer:
          "Não. O convite é estar ao ar livre com atenção. Chão sujo, ferimento ou lugar inseguro são motivos legítimos para ficar calçado.",
      },
      {
        question: "Isso limpa o campo energético?",
        answer:
          "Este texto não afirma isso. O efeito observável é outro: menos tela, mais luz do dia e uma pausa. O resto fica na crença de cada pessoa, sem promessa do portal.",
      },
      {
        question: "E quem mora sem praça?",
        answer:
          "Janela, vaso e o céu entre dois prédios já servem. O critério é contato com algo que não é tela, não um cenário perfeito.",
      },
    ],
  },
  "detox-digital-e-conexao-real-como-desligar-as-telas-cura-a-alma": {
    opening: scope(
      "Como reduzir tela num horário específico e falar com uma pessoa de verdade. Não pede que você suma das redes e não cura a alma."
    ),
    closing: practice(
      [
        "Escolha um horário de corte: a última hora antes de dormir ou a primeira meia hora depois de acordar. Um dos dois, não os dois no primeiro dia.",
        "Tire o aplicativo mais automático da primeira tela. Não precisa apagar a conta.",
        "Substitua esse intervalo por uma ação com gente ou com as mãos: uma ligação curta, lavar a louça olhando a louça, ou caminhar até a esquina.",
        "Se o trabalho exige tela à noite, o corte vale para a rede social, não para o ofício. Avise a equipe do horário em que você para, se isso for possível.",
      ],
      "Menos tela não resolve solidão sozinho. Se você desliga o celular e não tem com quem falar, o passo seguinte é um contato marcado, não mais isolamento. Uso que você não consegue interromper e que prejudica sono ou trabalho merece ajuda.",
      [
        {
          href: "/artigos/o-ritmo-do-descanso-a-ciencia-e-a-arte-do-sono-reparador",
          label: "Por que a última hora sem tela muda o sono",
        },
        {
          href: "/artigos/pe-na-terra-como-o-contato-com-a-natureza-limpa-a-nossa-energia",
          label: "Um lugar para ir quando a tela sai da mão",
        },
      ]
    ),
    faq: [
      {
        question: "Preciso deletar as redes?",
        answer:
          "Não. Reduzir o horário automático já mostra o efeito no sono e na atenção. Apagar a conta é uma escolha posterior, se você quiser.",
      },
      {
        question: "Trabalho com redes. Como faço?",
        answer:
          "Separe a conta de trabalho da rolagem sem fim. O corte pode ser só o aplicativo pessoal, num horário combinado.",
      },
      {
        question: "Ficar sem celular me deixa ansioso. É normal?",
        answer:
          "É comum no começo. Se a ansiedade for intensa ou você usa a tela para não sentir algo que está grande demais, procure ajuda em vez de transformar o corte numa prova.",
      },
    ],
  },
  "criando-o-seu-santuario-em-casa-passos-simples-para-um-cantinho-de-paz": {
    opening: scope(
      "Como reservar um canto da casa para pausar, com o que você já tem. Não é decoração, não exige aroma caro e não promete um ambiente que cure o cansaço."
    ),
    closing: practice(
      [
        "Escolha uma cadeira que já existe. Santuário aqui é uma função, não um cômodo novo.",
        "Tire daquele raio uma coisa que compete com a pausa: pilha de roupa, controle, ou o carregador do celular.",
        "Defina um sinal de início que dure dois minutos: luz mais baixa, uma música sem letra ou só silêncio. Use o mesmo sinal para o cérebro reconhecer a pausa.",
        "Combine com quem mora com você esse horário curto. Paz doméstica que ignora as outras pessoas vira conflito.",
      ],
      "Casa organizada não resolve sobrecarga de trabalho nem relação insegura. Se a sua casa não é um lugar seguro, o plano não é uma vela; é buscar apoio.",
      [
        {
          href: "/artigos/5-minutos-de-paz-tecnicas-de-relaxamento-para-quem-tem-a-mente-barulhenta",
          label: "O que fazer nesses minutos, se a mente não parar",
        },
        {
          href: "/artigos/detox-digital-e-conexao-real-como-desligar-as-telas-cura-a-alma",
          label: "Como deixar o celular fora desse canto",
        },
      ]
    ),
    faq: [
      {
        question: "Preciso comprar incenso e almofada?",
        answer:
          "Não. Cadeira, menos bagunça naquele ponto e um horário já criam o ritual. Objeto novo sem horário vira enfeite.",
      },
      {
        question: "Moro num quarto só. Cabe?",
        answer:
          "Cabe. O canto pode ser a cama fora do horário de dormir, com o celular em outro móvel. A regra é a função, não o metro quadrado.",
      },
      {
        question: "Luz baixa ajuda a dormir?",
        answer:
          "Ajuda a marcar o fim do dia para muita gente. O sono em si depende do horário e da saúde, não só da lâmpada.",
      },
    ],
  },
};

export function polishDescription(text: string): string {
  let d = text.replace(/\s+/g, " ").trim();
  if (!d) return d;
  if (d.length > 155) {
    const cut = d.slice(0, 156);
    const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
    if (stop >= 80) return cut.slice(0, stop + 1);
    const space = cut.lastIndexOf(" ");
    d = `${(space > 60 ? cut.slice(0, space) : cut).replace(/[,:;–—\-…\s]+$/g, "")}`;
    d = d.replace(/\s+\b(de|da|do|das|dos|em|na|no|para|com|que|um|uma|e|a|o)$/i, "");
    if (!/[.!?]$/.test(d)) d = `${d}.`;
    return d;
  }
  d = d.replace(/[…\s]+$/g, "").replace(/[,:;–—\-]+$/g, "");
  d = d.replace(/\s+\b(de|da|do|das|dos|em|na|no|para|com|que|um|uma|e|a|o)$/i, "");
  if (!/[.!?]$/.test(d)) d = `${d}.`;
  return d;
}

export function polishSubtitle(subtitle: string, title: string): string {
  let s = (subtitle || "").replace(/\s+/g, " ").trim();
  s = s.replace(/^Artigo\s+\d+\s*:\s*/i, "");
  if (!s || s.toLowerCase() === title.trim().toLowerCase()) return "";
  if (s.length > 150) {
    const cut = s.slice(0, 150);
    const space = cut.lastIndexOf(" ");
    s = `${(space > 40 ? cut.slice(0, space) : cut).replace(/[,:;–—\-]+$/g, "")}…`;
  }
  return s;
}

function plainText(html: string) {
  return html
    .replace(/<span class="dropcap">([^<]*)<\/span>/gi, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tocFrom(html: string): TocItem[] {
  return [...html.matchAll(/<h2[^>]*id="([^"]+)"[^>]*>(.*?)<\/h2>/gi)].map((match) => ({
    id: match[1],
    title: match[2].replace(/<[^>]+>/g, "").trim(),
  }));
}

function laterDate(current?: string, revision?: string) {
  const dates = [current, revision].filter((value): value is string => Boolean(value));
  return dates.sort().at(-1) || current || "";
}

export function applyEditorial(article: Article): Article {
  const extra = EXTRAS[article.slug];
  let content = article.content;
  let faq = article.faq ? [...article.faq] : [];
  let updatedAt = article.updatedAt;

  if (
    extra &&
    article.status === "published" &&
    !content.includes('data-editorial-extra="1"')
  ) {
    content = `${extra.opening}\n${content}\n${extra.closing}`;
    const seen = new Set(faq.map((item) => item.question));
    faq = [...faq, ...extra.faq.filter((item) => !seen.has(item.question))];
    updatedAt = laterDate(updatedAt, EDITORIAL_REVISION);
  }

  const text = plainText(content);
  const words = text ? text.split(" ").filter(Boolean).length : 0;
  const description = polishDescription(article.seo?.description || article.excerpt || "");

  return {
    ...article,
    subtitle: polishSubtitle(article.subtitle, article.title),
    content,
    contentText: text,
    faq,
    toc: tocFrom(content).length ? tocFrom(content) : article.toc,
    updatedAt,
    readingTime: Math.max(1, Math.round(words / 200) || 1),
    seo: {
      ...article.seo,
      description: description || article.seo?.description || "",
    },
  };
}
