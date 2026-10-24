/* =====================================================================
   museum-data.js
   Textos académicos curados para cada sala, atril y vitrina.
   Cátedra Levinton – Zurdo · Economía Clásica · UNLa
   ---------------------------------------------------------------------
   Para editar contenidos no hace falta tocar el resto del código:
   cada sala lee sus textos desde este objeto.
   ===================================================================== */
window.Museo = window.Museo || {};

Museo.data = {
  institucion: {
    universidad: "Universidad Nacional de Lanús",
    departamento: "Departamento de Desarrollo Productivo y Tecnológico",
    materia: "Economía Clásica",
    unidad: "Unidad VI: Thomas Malthus y el Principio de la Población",
    catedra: "Levinton – Zurdo",
    tituloMuseo: "Museo Virtual: El Principio de la Población"
  },

  /* Orden del recorrido. `id` es también el ancla de la URL (#sala-1, etc.). */
  salas: [
    { id: "hall",   numero: "Hall",  corto: "Hall",  titulo: "Hall de Entrada" },
    { id: "sala-1", numero: "Sala I",   corto: "I",   titulo: "El Origen del Debate y la Ruptura con la Ilustración" },
    { id: "sala-2", numero: "Sala II",  corto: "II",  titulo: "Los Dos Axiomas y la Asimetría Matemática" },
    { id: "sala-3", numero: "Sala III", corto: "III", titulo: "El Mecanismo de Ajuste: Frenos Preventivos vs. Represivos" },
    { id: "sala-4", numero: "Sala IV",  corto: "IV",  titulo: "El Juicio a las Leyes de Pobres (Poor Laws)" },
    { id: "sala-5", numero: "Sala V",   corto: "V",   titulo: "El Legado: De la Ciencia Lúgubre a la Economía Ecológica" },
    { id: "lab",    numero: "Laboratorio", corto: "Lab", titulo: "La Prueba de la Cátedra" }
  ],

  /* ------------------------------------------------------------------ */
  hall: {
    bienvenida:
      "Este museo recorre el Ensayo sobre el principio de la población (1798) en seis espacios. " +
      "En cada sala hay piezas para inspeccionar, un interactivo y una audio-guía. " +
      "Al final, la Prueba de la Cátedra emite tu boleto de visita.",
    ficha: {
      nombre: "Thomas Robert Malthus",
      vida: "1766 – 1834",
      obra: "An Essay on the Principle of Population, 1798",
      nota: "Retrato generado para la cátedra"
    },
    audio:
      "Bienvenidas y bienvenidos al Museo Virtual del Principio de la Población, de la cátedra Levinton Zurdo, " +
      "Universidad Nacional de Lanús. Thomas Robert Malthus publicó en 1798, de forma anónima, un ensayo que " +
      "cambió la manera de pensar la pobreza. El recorrido tiene cinco salas y un laboratorio final. " +
      "Pueden seguir el orden sugerido o saltar entre salas desde el plano del museo."
  },

  /* ------------------------------------------------------------------ */
  sala1: {
    ambiente: "Galería histórica · Inglaterra, fines del siglo XVIII",
    contexto: {
      titulo: "Transformación material en Inglaterra",
      puntos: [
        "Acelerada industrialización y éxodo campesino hacia los centros urbanos fabriles.",
        "Encarecimiento crítico del grano por las guerras napoleónicas y las malas cosechas.",
        "Aumento del gasto parroquial de asistencia y proliferación del pauperismo."
      ],
      pie: "Ilustración de contexto: el campo inglés y los primeros molinos hidráulicos."
    },
    atriles: [
      {
        id: "godwin",
        cat: "Atril A",
        titulo: "La Utopía de Godwin y Condorcet",
        autores: "William Godwin, Political Justice (1793) · Marqués de Condorcet, Esquisse (1795)",
        tesis: "La desigualdad, la opresión y el vicio nacen de malas instituciones políticas y de leyes humanas corruptas.",
        puntos: [
          "La razón y la educación pueden perfeccionar indefinidamente al ser humano.",
          "Reformadas las instituciones, la miseria desaparece: es un problema político.",
          "El progreso moral llegaría a moderar incluso las pasiones."
        ],
        veredicto: "La pobreza es social. Se corrige cambiando la sociedad."
      },
      {
        id: "malthus",
        cat: "Atril B",
        titulo: "El Realismo Trágico de Malthus",
        autores: "T. R. Malthus, An Essay on the Principle of Population (1798)",
        tesis: "La miseria humana no proviene del orden institucional, sino de leyes naturales y biológicas que ninguna reforma puede anular.",
        puntos: [
          "Desresponsabilización institucional: la escasez deja de atribuirse a la distribución de la tierra o al poder estatal.",
          "Conflicto central: la reproducción tiene un potencial expansivo ilimitado y el suelo, una capacidad finita.",
          "Giro metodológico: la pobreza se naturaliza y pasa a ser una ley."
        ],
        veredicto: "La pobreza es natural. Ninguna reforma la suprime."
      }
    ],
    cita: {
      texto: "El poder de la población es infinitamente mayor que el poder de la tierra para producir subsistencia para el hombre.",
      fuente: "T. R. Malthus, Ensayo sobre el principio de la población, cap. I (1798)"
    },
    nota:
      "El Ensayo de 1798 nació de una discusión de Malthus con su padre, Daniel, admirador de Rousseau y de Godwin.",
    audio:
      "Sala uno. Estamos en la Inglaterra de fines del siglo dieciocho: industrialización, éxodo rural, pan caro por la guerra con Francia " +
      "y un gasto parroquial en ayuda a los pobres que no deja de crecer. Frente a frente hay dos atriles. En el primero, Godwin y Condorcet " +
      "sostienen que la miseria es obra de malas instituciones y que la razón puede abolirla. En el segundo, Malthus responde que la miseria " +
      "obedece a leyes naturales: la población tiende a crecer más rápido que los alimentos. Ese es el giro decisivo: la pobreza deja de ser " +
      "un problema político y pasa a ser una ley de la naturaleza."
  },

  /* ------------------------------------------------------------------ */
  sala2: {
    ambiente: "Gabinete matemático y demográfico",
    postulados: [
      {
        num: "Postulado I",
        titulo: "La necesidad del alimento",
        cita: "«El alimento es necesario a la existencia del hombre»",
        puntos: [
          "Constante fisiológica: el ser humano necesita un aporte nutricional diario para sobrevivir.",
          "Dependencia del suelo: las subsistencias vienen de la agricultura, limitada por la tierra fértil disponible.",
          "Inalterabilidad: ningún progreso moral o intelectual permite prescindir del alimento."
        ]
      },
      {
        num: "Postulado II",
        titulo: "La pasión entre los sexos",
        cita: "«La pasión entre los sexos es necesaria y constante»",
        puntos: [
          "Impulso permanente: la inclinación reproductiva se mantiene igual a lo largo de las épocas.",
          "Rechazo a Godwin: el refinamiento cultural no extingue ni atenúa ese impulso.",
          "Efecto demográfico: sin obstáculos severos, genera una procreación continua y expansiva."
        ]
      }
    ],
    conclusion:
      "Como ambas leyes actuaron siempre y seguirán actuando, la fuerza de crecimiento de la población es infinitamente mayor " +
      "que la capacidad de la tierra para producir alimentos. Esa asimetría es el núcleo del Principio de la Población.",
    poblacion: {
      titulo: "Población: progresión geométrica",
      serie: "1, 2, 4, 8, 16, 32, 64…",
      texto: "Sin obstáculos, la población se duplica cada 25 años (Malthus toma el ejemplo de las colonias norteamericanas)."
    },
    alimentos: {
      titulo: "Subsistencias: progresión aritmética",
      serie: "1, 2, 3, 4, 5, 6, 7…",
      texto: "En el mejor de los casos, la producción crece en cantidades constantes: las tierras marginales rinden cada vez menos."
    },
    remate: "En dos siglos la proporción sería de 256 a 9; en tres, de 4.096 a 13.",
    audio:
      "Sala dos, el gabinete matemático. Malthus parte de dos postulados: el alimento es necesario para vivir, y la pasión entre los sexos " +
      "es necesaria y constante. De allí deriva su famosa asimetría. La población, sin frenos, crece en progresión geométrica y se duplica " +
      "cada veinticinco años: uno, dos, cuatro, ocho, dieciséis. Los alimentos, en el mejor de los casos, crecen en progresión aritmética: " +
      "uno, dos, tres, cuatro, cinco. Muevan el control del simulador y observen cómo, a partir del año cincuenta, las curvas se separan " +
      "y se abre la brecha malthusiana."
  },

  /* ------------------------------------------------------------------ */
  sala3: {
    ambiente: "La Balanza de la Naturaleza",
    intro:
      "Cuando la población supera las subsistencias, el equilibrio se restablece por dos vías. " +
      "Los frenos preventivos bajan la natalidad; los represivos (o positivos) elevan la mortalidad.",
    frenos: [
      {
        lado: "preventivo",
        titulo: "Restricción moral",
        etiqueta: "Preventivo · vía virtuosa",
        frente: "Retrasar el matrimonio, celibato previo, no casarse sin ingresos.",
        dorso:
          "Es el freno propiamente humano: nace de la previsión y del cálculo racional sobre el futuro. Malthus lo incorpora " +
          "con fuerza en la 2.ª edición del Ensayo (1803) y lo considera la única salida compatible con la virtud."
      },
      {
        lado: "preventivo",
        titulo: "Vicio",
        etiqueta: "Preventivo · vía viciosa",
        frente: "Promiscuidad, uniones irregulares, anticoncepción.",
        dorso:
          "También reduce los nacimientos, pero Malthus lo condena por motivos morales y religiosos: era pastor anglicano " +
          "y rechazaba los métodos anticonceptivos."
      },
      {
        lado: "represivo",
        titulo: "Miseria",
        etiqueta: "Represivo · positivo",
        frente: "Pobreza extrema, malnutrición, trabajo insalubre, hacinamiento.",
        dorso:
          "Opera de manera ciega cuando la restricción preventiva no actuó con suficiente vigor. Golpea sobre todo a la " +
          "infancia de los sectores obreros."
      },
      {
        lado: "represivo",
        titulo: "Catástrofe",
        etiqueta: "Represivo · positivo",
        frente: "Hambrunas, epidemias, pestes y guerras por los recursos.",
        dorso:
          "Es la forma violenta en que, según Malthus, la naturaleza destruye el excedente humano que la tierra no puede " +
          "alimentar y restablece el equilibrio."
      }
    ],
    /* Clasificador: `freno` = "preventivo" | "represivo" */
    situaciones: [
      { id: "s1", texto: "Jornaleros ingleses posponen la boda hasta reunir lo necesario para sostener un hogar.", freno: "preventivo",
        explica: "Retrasar el matrimonio baja la natalidad: es restricción moral." },
      { id: "s2", texto: "Gran Hambruna irlandesa (1845–1849): cerca de un millón de muertes.", freno: "represivo",
        explica: "El hambre eleva la mortalidad: freno represivo." },
      { id: "s3", texto: "Peste negra en Europa (1347–1351).", freno: "represivo",
        explica: "Las epidemias son un freno positivo clásico en la tipología malthusiana." },
      { id: "s4", texto: "Fiebre tifoidea en los barrios obreros hacinados de Manchester (década de 1840).", freno: "represivo",
        explica: "Hacinamiento y enfermedad: miseria que aumenta las muertes." },
      { id: "s5", texto: "Un artesano decide no casarse hasta tener ingresos suficientes para criar hijos.", freno: "preventivo",
        explica: "Es el ejemplo de manual de la restricción moral." },
      { id: "s6", texto: "Escasez de grano durante las guerras napoleónicas y el bloqueo continental.", freno: "represivo",
        explica: "Guerra y escasez actúan sobre la mortalidad." },
      { id: "s7", texto: "Celibato prolongado y matrimonio tardío en la Europa occidental del siglo XVIII.", freno: "preventivo",
        explica: "Menos años de vida conyugal significan menos nacimientos." },
      { id: "s8", texto: "Uniones irregulares y métodos anticonceptivos, condenados por Malthus.", freno: "preventivo",
        explica: "Bajan la natalidad, por eso son preventivos, aunque Malthus los ubique en la vía viciosa." }
    ],
    audio:
      "Sala tres, la balanza de la naturaleza. Cuando la población presiona sobre las subsistencias, el equilibrio vuelve por dos caminos. " +
      "Los frenos preventivos actúan sobre la natalidad: la restricción moral, es decir, postergar el matrimonio y no casarse sin medios, " +
      "y lo que Malthus llama vicio. Los frenos represivos o positivos actúan sobre la mortalidad: miseria, hambre, epidemias y guerras. " +
      "Den vuelta las tarjetas y luego clasifiquen las situaciones históricas en el platillo que corresponda."
  },

  /* ------------------------------------------------------------------ */
  sala4: {
    ambiente: "Tribunal de debate parlamentario británico",
    causa: "Causa: Las Leyes de Pobres (Poor Laws) y el sistema de Speenhamland (1795)",
    intro:
      "Malthus sostiene que la beneficencia institucional agrava la miseria que busca aliviar. " +
      "Escuchen a cada parte y emitan su propio veredicto.",
    acusacion: {
      titulo: "Argumento malthusiano",
      quien: "T. R. Malthus",
      argumentos: [
        {
          titulo: "El estímulo perverso",
          texto:
            "El subsidio parroquial por cada hijo elimina el temor prudencial a no poder alimentar a la familia, " +
            "promueve matrimonios prematuros y crea una trampa de dependencia."
        },
        {
          titulo: "La dilución del salario real",
          texto:
            "Repartir dinero no agrega un solo quintal de trigo. Más dinero compitiendo por el mismo grano eleva el precio del pan " +
            "y empobrece al obrero que no pide ayuda."
        },
        {
          titulo: "La abolición gradual",
          texto:
            "Nadie tiene derecho natural a ser alimentado por la sociedad. Propone fijar una fecha desde la cual ningún niño nacido " +
            "reciba asistencia pública: el individuo debe afrontar solo el mandato de la naturaleza."
        }
      ]
    },
    defensa: {
      titulo: "Objeciones contemporáneas",
      quien: "Sismondi · Destutt de Tracy",
      argumentos: [
        {
          titulo: "Jean de Sismondi: crítica distributiva",
          texto:
            "La indigencia proletaria no es un defecto biológico de la procreación sino el resultado del régimen de explotación salarial. " +
            "El desempleo tecnológico y la mala distribución impiden al trabajador acceder al sustento que él mismo produce."
        },
        {
          titulo: "Destutt de Tracy: reparto, no escasez",
          texto:
            "No hay un exceso absoluto de población. Hay una pésima distribución de la riqueza y un acaparamiento ocioso de recursos " +
            "por minorías rentistas: el problema es de subconsumo y de reparto, no de avaricia de la naturaleza."
        },
        {
          titulo: "La legitimación ideológica",
          texto:
            "La doctrina malthusiana funcionó como coartada moral: tranquilizó la conciencia de las clases propietarias británicas " +
            "frente a las miserias de la Revolución Industrial."
        }
      ]
    },
    epilogo:
      "En 1834, el año de la muerte de Malthus, el Parlamento aprobó la Poor Law Amendment Act: la ayuda fuera de las workhouses " +
      "quedó restringida y las condiciones dentro de ellas se volvieron deliberadamente duras.",
    audio:
      "Sala cuatro, el tribunal. Se juzgan las Leyes de Pobres. Malthus acusa: el subsidio por hijo estimula la natalidad, " +
      "repartir dinero sin aumentar el trigo sólo sube el precio del pan, y por eso propone abolir gradualmente la asistencia. " +
      "La defensa responde: para Sismondi, la miseria nace de la explotación salarial y la mala distribución; para Destutt de Tracy, " +
      "el problema es de reparto y subconsumo, no de escasez absoluta. Escuchen las intervenciones y emitan su veredicto."
  },

  /* ------------------------------------------------------------------ */
  sala5: {
    ambiente: "Sala contemporánea",
    intro: "El principio poblacional transformó la economía clásica y reapareció, dos siglos después, en el debate ecológico.",
    vitrinas: [
      {
        id: "ricardo",
        cat: "Vitrina 1",
        titulo: "El salario de subsistencia en David Ricardo",
        fecha: "Principios de economía política y tributación, 1817",
        resumen: "Malthus le da a Ricardo el fundamento demográfico de su teoría del salario.",
        cuerpo: [
          "El salario de mercado oscila alrededor de un salario natural: el que permite a los trabajadores subsistir y perpetuar su especie.",
          "Si el salario sube, la población obrera crece; la mayor oferta de brazos vuelve a hundir las remuneraciones hacia la subsistencia.",
          "De ahí el mote de «ciencia lúgubre» (dismal science) que Thomas Carlyle aplicó a la economía política en 1849."
        ],
        ciclo: ["Salario ↑", "Natalidad ↑", "Oferta de brazos ↑", "Salario ↓"]
      },
      {
        id: "marx",
        cat: "Vitrina 2",
        titulo: "La crítica de Marx al malthusianismo",
        fecha: "El Capital, tomo I, cap. 23, 1867",
        resumen: "No existe una ley abstracta de la población: cada modo de producción tiene la suya.",
        cuerpo: [
          "La sobrepoblación que observa Malthus no es absoluta sino relativa: es el ejército industrial de reserva que la propia acumulación de capital crea y recrea.",
          "Al presentar el hambre y el desempleo como castigos de la naturaleza, el malthusianismo naturaliza el orden capitalista naciente y se vuelve baluarte del laissez-faire más despiadado.",
          "Marx llegó a calificar el Ensayo de plagio superficial de autores anteriores, como Steuart, Townsend y Wallace."
        ],
        ciclo: ["Acumulación", "Máquinas", "Desempleo", "Ejército de reserva"]
      },
      {
        id: "ecologia",
        cat: "Vitrina 3",
        titulo: "Límites planetarios y huella ecológica",
        fecha: "Siglos XX y XXI",
        resumen: "El modelo agrícola lineal fue superado, pero la pregunta por los límites volvió.",
        cuerpo: [
          "Club de Roma, Los límites del crecimiento (Meadows et al., 1972): simulaciones de población, recursos y contaminación.",
          "Capacidad de carga y huella ecológica (Wackernagel y Rees, 1996): cuánta superficie productiva requiere sostener un nivel de consumo.",
          "Límites planetarios (Rockström et al., 2009): nueve procesos del sistema Tierra con umbrales de seguridad, del clima a los ciclos de nitrógeno y fósforo."
        ],
        ciclo: ["Población", "Consumo", "Recursos finitos", "Umbral"]
      }
    ],
    porQue: {
      titulo: "¿Por qué no se cumplió la catástrofe?",
      items: [
        {
          titulo: "Revolución agrícola y tecnológica",
          texto: "Malthus subestimó la innovación: mecanización, fertilizantes sintéticos (síntesis de Haber-Bosch), genética de semillas y riego. La productividad creció muy por encima de la progresión aritmética."
        },
        {
          titulo: "Transición demográfica",
          texto: "Malthus creía que más riqueza traía más nacimientos. Ocurrió lo contrario: urbanización, salarios reales más altos, educación y anticoncepción hicieron caer la fecundidad."
        }
      ]
    },
    audio:
      "Sala cinco, el legado. En la primera vitrina, David Ricardo: el salario tiende a la subsistencia porque, si sube, la población crece " +
      "y lo vuelve a bajar. En la segunda, Karl Marx: no hay una ley natural de la población, sino una sobrepoblación relativa, el ejército " +
      "industrial de reserva, que crea la acumulación de capital. En la tercera, la economía ecológica: Los límites del crecimiento, la huella " +
      "ecológica y los límites planetarios retoman la pregunta por los recursos finitos. Al salir, pregúntense por qué la catástrofe anunciada no ocurrió."
  },

  /* ------------------------------------------------------------------ */
  lab: {
    intro:
      "Cuatro preguntas para verificar lo aprendido. Cada respuesta tiene una explicación. " +
      "Al terminar, escribí tu nombre y emití tu boleto de visita.",
    preguntas: [
      {
        id: "q1",
        enunciado: "Según Malthus, ¿cómo crece la población cuando no encuentra obstáculos?",
        opciones: [
          { id: "a", texto: "En progresión aritmética: suma una cantidad fija cada 25 años." },
          { id: "b", texto: "En progresión geométrica: se duplica cada 25 años." },
          { id: "c", texto: "Al mismo ritmo que la producción de alimentos." },
          { id: "d", texto: "De forma decreciente a medida que aumenta la riqueza." }
        ],
        correcta: "b",
        explicacion:
          "La población sigue la serie 1, 2, 4, 8, 16…; los alimentos, 1, 2, 3, 4, 5… La diferencia entre multiplicar y sumar es la asimetría central del Ensayo."
      },
      {
        id: "q2",
        enunciado: "¿Cuál de estas situaciones es un freno preventivo?",
        opciones: [
          { id: "a", texto: "Una epidemia de tifus en un barrio obrero." },
          { id: "b", texto: "Una guerra por el control de tierras fértiles." },
          { id: "c", texto: "Postergar el matrimonio hasta poder sostener una familia." },
          { id: "d", texto: "Una hambruna provocada por malas cosechas." }
        ],
        correcta: "c",
        explicacion:
          "Los frenos preventivos actúan sobre la natalidad. Postergar el matrimonio es la restricción moral que Malthus defiende. Las otras tres opciones elevan la mortalidad: son frenos represivos."
      },
      {
        id: "q3",
        enunciado: "¿Por qué Malthus consideraba perjudiciales las Leyes de Pobres?",
        opciones: [
          { id: "a", texto: "Porque el subsidio estimulaba la natalidad y, sin más trigo, sólo subía el precio del pan." },
          { id: "b", texto: "Porque eran demasiado bajas para garantizar la subsistencia." },
          { id: "c", texto: "Porque las financiaban los trabajadores con sus salarios." },
          { id: "d", texto: "Porque desalentaban la inversión industrial en las ciudades." }
        ],
        correcta: "a",
        explicacion:
          "Malthus ve un estímulo perverso (quita el temor a no poder alimentar a los hijos) y una dilución del salario real: más dinero persiguiendo el mismo grano encarece el pan."
      },
      {
        id: "q4",
        enunciado: "¿Qué objeción plantea Sismondi frente a Malthus?",
        opciones: [
          { id: "a", texto: "Que la tierra es infinitamente fértil y no hay límites." },
          { id: "b", texto: "Que la miseria resulta de la explotación salarial y la mala distribución, no de la biología." },
          { id: "c", texto: "Que la población crece más rápido de lo que Malthus calculó." },
          { id: "d", texto: "Que las Leyes de Pobres debían abolirse de inmediato." }
        ],
        correcta: "b",
        explicacion:
          "Sismondi desplaza el problema de la procreación a la distribución: el trabajador no accede al sustento que él mismo produce. Es una crítica distributiva."
      }
    ],
    audio:
      "Llegaron al laboratorio, la prueba de la cátedra. Son cuatro preguntas de opción múltiple. Después de cada respuesta van a ver " +
      "una explicación. Al final, escriban su nombre para emitir el boleto de visita con el sello de la cátedra."
  }
};
