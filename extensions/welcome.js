// ============================================
// WELCOME - Popup de boas-vindas
// ============================================
(function() {
    if (Injector.isMainFrame()) return;

    var CURRENT_VERSION = '1.2.3';
    var currentPage = 0;
    var currentLang = localStorage.getItem('haxball_language') || 'pt';

    var TRANSLATIONS = {
        pt: {
            welcomeTitle: 'Bem-vindo à v' + CURRENT_VERSION,
            welcomeText: 'Esta versão traz diversas melhorias de desempenho, permitindo que você personalize o jogo para rodar da melhor forma possível no seu computador.<br><br>Todos os bugs reportados na versão anterior foram corrigidos, incluindo o problema que impedia o logout quando havia duas contas vinculadas.<br><br>Nas próximas páginas, explicamos cada novidade em detalhes.',
            langTitle: 'Idioma',
            langText: 'Desde o lançamento, recebemos muito carinho de jogadores de toda a América Latina! Argentinos, uruguaios, chilenos, peruanos e tantos outros nos pediram suporte ao espanhol.<br><br>Então aqui está: agora você pode usar o aplicativo no seu idioma. Gracias por todo el apoyo!',
            perfTitle: 'Desempenho',
            perfText: 'Adicionamos uma nova aba de Desempenho nas configurações com várias opções para otimizar seu jogo:',
            perfItems: [
                { title: 'Linhas simplificadas', desc: 'Reduz a espessura das linhas do campo de 3px para 1px.' },
                { title: 'Curvas viram retas', desc: 'Converte todas as linhas curvas em retas.' },
                { title: 'Culling de viewport', desc: 'Não desenha objetos fora da tela.' },
                { title: 'Desativar avatares e cores', desc: 'Remove avatares personalizados e usa cores padrão.' },
                { title: 'Desativar nomes', desc: 'Esconde os nomes dos jogadores.' },
                { title: 'Campo simplificado', desc: 'Usa cores sólidas no campo ao invés de imagens.' },
                { title: 'Círculos de baixa qualidade', desc: 'Pré-renderiza os círculos. Mais rápido mas pixelado.' },
                { title: 'Desativar animações de gol', desc: 'Remove as animações quando um gol é marcado.' },
                { title: 'Desativar indicador do jogador', desc: 'O círculo que mostra onde você está.' },
                { title: 'Desativar indicador de chat', desc: 'O balão que aparece quando alguém fala.' },
                { title: 'Alta prioridade', desc: 'Dá mais recursos do sistema para o jogo.' }
            ],
            perfFooter: 'Exporte e importe suas configurações para compartilhar com amigos.',
            fixesTitle: 'Correções',
            fixesText: 'Problemas resolvidos nesta versão:',
            fixesItems: [
                'Login do Discord travava e abria uma pasta ao invés do navegador',
                'Texto "avatar set" ficava infinito ao usar /gif',
                'Otimizamos as requisições ao banco de dados para manter o ping estável',
                'Agora dá pra copiar o texto do chat normalmente'
            ],
            additionsTitle: 'Outras Adições',
            additionsText: 'Outras novidades que chegaram nesta versão:',
            additionsItems: [
                'Possível escolher resolução de 0 à 100%',
                'Atalho para fechar a header com tecla',
                'Limite de FPS baseado no monitor (gracias <b>rama</b> y <b>ysaias</b>)',
                'Melhorias na UI/UX (gracias <b>yuri</b> y <b>i76k</b>)',
                'Comando /input que simula um pequeno input lag para pessoas acostumadas',
                'Mais limites de caractere no nick (gracias <b>sankuu</b>)',
                'Host Token para criar salas sem precisar do reCAPTCHA',
                'Novos temas: Claro, Onix e Padrão',
                'Fixar salas no topo da lista',
                'Atualizador automático'
            ],
            teamTitle: 'Equipe',
            teamText: 'Crie ou entre em uma equipe para jogar com seus amigos! O sistema de equipes permite que você organize seu time com identidade visual própria.',
            teamItems: [
                { title: 'Crie sua Equipe', desc: 'Usuários Pro podem criar equipes com nome e logo personalizados.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
                { title: 'Convide Membros', desc: 'Envie convites pelo username do Discord para montar seu time.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>' },
                { title: 'Badge no Chat', desc: 'Membros da equipe exibem o logo ao lado do nick no chat.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
                { title: 'Gerencie seu Time', desc: 'Altere nome, sigla e logo a qualquer momento.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' }
            ],
            teamFooter: 'Acesse o painel de Equipe pelo menu lateral para começar.',
            thanksTitle: 'Agradecimentos',
            thanksText: 'Pessoas que ajudaram a tornar este projeto possível:',
            thanksItems: [
                { title: '<b>tenkaa</b>', desc: 'Detectou uma falha grave de segurança que poderia atrapalhar totalmente o projeto.' },
                { title: '<b>aprodo</b>', desc: 'Apresentou a versão 91 do Iron que é usado como base na versão Chromium e aumenta o FPS na maioria dos computadores.' },
                { title: '<b>night</b>, <b>dingusboy</b>, <b>Dzeko</b>, <b>Tekka</b>, <b>SUT Gabo</b>, <b>levi</b>, <b>seath</b>, <b>SirBusquets</b>', desc: 'Divulgaram e testaram o aplicativo desde as primeiras versões detectando erros e dando suas opiniões.' },
                { title: '<b>castrolito</b>, <b>tix</b>, <b>zethus</b>, <b>zlatan</b>, <b>luzada!</b>, <b>mrks</b>, <b>tom</b>, <b>k1nGordo</b>, <b>sankuu</b>, <b>gate</b>', desc: 'Detectaram bugs importantes para serem resolvidos.' },
                { title: '<b>Comunidade</b>', desc: 'Fortalece o projeto apresentando ideias, criticando e reportando os bugs, é a maior razão pelo qual o aplicativo continua em constante evolução que infelizmente o nosso HaxBall não tem.' }
            ],
            proTitle: 'Pro',
            proText: 'Apoie o projeto e desbloqueie recursos exclusivos por apenas $4/mês:',
            proItems: [
                { title: 'Personalização Total', desc: 'Cores, fontes e gradientes no seu nick e chat.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>' },
                { title: 'Verificado Exclusivo', desc: 'Badge exclusivo com a cor que você escolher.', icon: '<svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z" fill="currentColor"/><path d="M15 9l-4.5 4.5L8 11" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                { title: 'Criar Equipes', desc: 'Monte sua equipe com identidade visual.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
                { title: 'Acesso Antecipado', desc: 'Teste novos recursos antes de todos.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>' },
                { title: 'Apoie o Projeto', desc: 'Sua assinatura ajuda a manter o app funcionando.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' }
            ],
            proFooter: 'Ex-assinantes ganham 1 semana grátis sempre que lançarmos novidades Pro.',
            prev: 'Anterior',
            next: 'Próximo',
            start: 'Começar',
            portuguese: 'Português',
            spanish: 'Español'
        },
        es: {
            welcomeTitle: 'Bienvenido a v' + CURRENT_VERSION,
            welcomeText: 'Esta versión trae diversas mejoras de rendimiento, permitiéndote personalizar el juego para que funcione de la mejor manera posible en tu computadora.<br><br>Todos los bugs reportados en la versión anterior fueron corregidos, incluyendo el problema que impedía cerrar sesión cuando había dos cuentas vinculadas.<br><br>En las próximas páginas, explicamos cada novedad en detalle.',
            langTitle: 'Idioma',
            langText: 'Desde el lanzamiento, recibimos mucho cariño de jugadores de toda América Latina! Argentinos, chilenos, peruanos y tantos otros nos pidieron soporte en español.<br><br>Así que aquí está: ahora puedes usar la aplicación en tu idioma. Gracias por todo el apoyo!',
            perfTitle: 'Rendimiento',
            perfText: 'Agregamos una nueva pestaña de Rendimiento en la configuración con varias opciones para optimizar tu juego:',
            perfItems: [
                { title: 'Líneas simplificadas', desc: 'Reduce el grosor de las líneas del campo de 3px a 1px.' },
                { title: 'Curvas se vuelven rectas', desc: 'Convierte todas las líneas curvas en rectas.' },
                { title: 'Culling de viewport', desc: 'No dibuja objetos fuera de la pantalla.' },
                { title: 'Desactivar avatares y colores', desc: 'Elimina avatares personalizados y usa colores estándar.' },
                { title: 'Desactivar nombres', desc: 'Oculta los nombres de los jugadores.' },
                { title: 'Campo simplificado', desc: 'Usa colores sólidos en el campo en lugar de imágenes.' },
                { title: 'Círculos de baja calidad', desc: 'Pre-renderiza los círculos. Más rápido pero pixelado.' },
                { title: 'Desactivar animaciones de gol', desc: 'Elimina las animaciones cuando se marca un gol.' },
                { title: 'Desactivar indicador del jugador', desc: 'El círculo que muestra dónde estás.' },
                { title: 'Desactivar indicador de chat', desc: 'El globo que aparece cuando alguien habla.' },
                { title: 'Alta prioridad', desc: 'Da más recursos del sistema al juego.' }
            ],
            perfFooter: 'Exporta e importa tus configuraciones para compartir con amigos.',
            fixesTitle: 'Correcciones',
            fixesText: 'Problemas resueltos en esta versión:',
            fixesItems: [
                'Login de Discord se trababa y abría una carpeta en vez del navegador',
                'Texto "avatar set" quedaba infinito al usar /gif',
                'Optimizamos las solicitudes a la base de datos para mantener el ping estable',
                'Ahora puedes copiar el texto del chat normalmente'
            ],
            additionsTitle: 'Otras Adiciones',
            additionsText: 'Novedades que llegaron en esta versión:',
            additionsItems: [
                'Posible elegir resolución de 0 a 100%',
                'Atajo para cerrar la header con tecla',
                'Límite de FPS basado en el monitor (gracias <b>rama</b> y <b>ysaias</b>)',
                'Mejoras en la UI/UX (gracias <b>yuri</b> y <b>i76k</b>)',
                'Comando /input que simula un pequeño input lag para personas acostumbradas',
                'Más límites de caracteres en el nick (gracias <b>sankuu</b>)',
                'Host Token para crear salas sin necesitar el reCAPTCHA',
                'Nuevos temas: Claro, Onix y Estándar',
                'Fijar salas en la parte superior de la lista',
                'Actualizador automático'
            ],
            teamTitle: 'Equipo',
            teamText: '¡Crea o únete a un equipo para jugar con tus amigos! El sistema de equipos te permite organizar tu team con identidad visual propia.',
            teamItems: [
                { title: 'Crea tu Equipo', desc: 'Usuarios Pro pueden crear equipos con nombre y logo personalizados.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
                { title: 'Invita Miembros', desc: 'Envía invitaciones por username de Discord para armar tu team.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>' },
                { title: 'Badge en el Chat', desc: 'Los miembros del equipo muestran el logo junto al nick en el chat.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
                { title: 'Gestiona tu Team', desc: 'Cambia nombre, sigla y logo en cualquier momento.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' }
            ],
            teamFooter: 'Accede al panel de Equipo desde el menú lateral para comenzar.',
            thanksTitle: 'Agradecimientos',
            thanksText: 'Personas que ayudaron a hacer este proyecto posible:',
            thanksItems: [
                { title: '<b>tenkaa</b>', desc: 'Detectó una falla grave de seguridad que podría perjudicar totalmente el proyecto.' },
                { title: '<b>aprodo</b>', desc: 'Presentó la versión 91 de Iron que se usa como base en la versión Chromium y aumenta el FPS en la mayoría de las computadoras.' },
                { title: '<b>night</b>, <b>dingusboy</b>, <b>Dzeko</b>, <b>Tekka</b>, <b>SUT Gabo</b>, <b>levi</b>, <b>seath</b>, <b>SirBusquets</b>', desc: 'Divulgaron y probaron la aplicación desde las primeras versiones detectando errores y dando sus opiniones.' },
                { title: '<b>castrolito</b>, <b>tix</b>, <b>zethus</b>, <b>zlatan</b>, <b>luzada!</b>, <b>mrks</b>, <b>tom</b>, <b>k1nGordo</b>, <b>sankuu</b>, <b>gate</b>', desc: 'Detectaron bugs importantes para ser resueltos.' },
                { title: '<b>Comunidad</b>', desc: 'Fortalece el proyecto presentando ideas, criticando y reportando los bugs, es la mayor razón por la cual la aplicación continúa en constante evolución que lamentablemente nuestro HaxBall no tiene.' }
            ],
            proTitle: 'Pro',
            proText: 'Apoya el proyecto y desbloquea recursos exclusivos por solo $4/mes:',
            proItems: [
                { title: 'Personalización Total', desc: 'Colores, fuentes y gradientes en tu nick y chat.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>' },
                { title: 'Verificado Exclusivo', desc: 'Badge exclusivo con el color que elijas.', icon: '<svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z" fill="currentColor"/><path d="M15 9l-4.5 4.5L8 11" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                { title: 'Crear Equipos', desc: 'Arma tu equipo con identidad visual.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
                { title: 'Acceso Anticipado', desc: 'Prueba nuevos recursos antes que todos.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>' },
                { title: 'Apoya el Proyecto', desc: 'Tu suscripción ayuda a mantener la app funcionando.', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' }
            ],
            proFooter: 'Ex-suscriptores ganan 1 semana gratis cada vez que lancemos novedades Pro.',
            prev: 'Anterior',
            next: 'Siguiente',
            start: 'Comenzar',
            portuguese: 'Português',
            spanish: 'Español'
        }
    };

    function t(key) {
        return TRANSLATIONS[currentLang][key] || TRANSLATIONS['pt'][key] || key;
    }

    function createListHTML(items, twoColumns) {
        if (twoColumns) {
            var half = Math.ceil(items.length / 2);
            var col1 = items.slice(0, half);
            var col2 = items.slice(half);
            
            function renderCol(colItems) {
                var html = '';
                for (var i = 0; i < colItems.length; i++) {
                    var item = colItems[i];
                    if (typeof item === 'object') {
                        html += '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px;white-space:nowrap;">' +
                            '<div style="width:5px;height:5px;background:#555;border-radius:50%;flex-shrink:0;margin-top:5px;"></div>' +
                            '<div>' +
                                '<div style="color:#ccc;font-size:12px;font-weight:500;">' + item.title + '</div>' +
                                '<div style="color:#555;font-size:10px;margin-top:1px;">' + item.desc + '</div>' +
                            '</div>' +
                        '</div>';
                    } else {
                        html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;white-space:nowrap;">' +
                            '<div style="width:5px;height:5px;background:#555;border-radius:50%;flex-shrink:0;"></div>' +
                            '<span style="color:#999;font-size:12px;">' + item + '</span>' +
                        '</div>';
                    }
                }
                return html;
            }
            
            return '<div style="display:flex;gap:24px;margin-top:14px;">' +
                '<div style="flex:1;">' + renderCol(col1) + '</div>' +
                '<div style="flex:1;">' + renderCol(col2) + '</div>' +
            '</div>';
        } else {
            var html = '<div style="margin-top:14px;display:flex;flex-direction:column;gap:12px;">';
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (typeof item === 'object') {
                    if (item.icon) {
                        html += '<div style="display:flex;align-items:flex-start;gap:14px;white-space:nowrap;">' +
                            '<div style="color:#888;flex-shrink:0;display:flex;align-items:center;height:20px;">' + item.icon + '</div>' +
                            '<div>' +
                                '<div style="color:#fff;font-size:14px;font-weight:500;line-height:20px;">' + item.title + '</div>' +
                                '<div style="color:#666;font-size:12px;margin-top:4px;">' + item.desc + '</div>' +
                            '</div>' +
                        '</div>';
                    } else {
                        html += '<div style="display:flex;align-items:flex-start;gap:10px;white-space:nowrap;">' +
                            '<div style="width:5px;height:5px;background:#555;border-radius:50%;flex-shrink:0;margin-top:6px;"></div>' +
                            '<div>' +
                                '<div style="color:#ccc;font-size:13px;font-weight:500;">' + item.title + '</div>' +
                                '<div style="color:#555;font-size:11px;margin-top:2px;">' + item.desc + '</div>' +
                            '</div>' +
                        '</div>';
                    }
                } else {
                    html += '<div style="display:flex;align-items:center;gap:10px;white-space:nowrap;">' +
                        '<div style="width:5px;height:5px;background:#555;border-radius:50%;flex-shrink:0;"></div>' +
                        '<span style="color:#999;font-size:13px;">' + item + '</span>' +
                    '</div>';
                }
            }
            html += '</div>';
            return html;
        }
    }

    // Preview minimalista da aba de desempenho
    function getPerfPreview() {
        return '<div style="background:#0a0a0a;border:1px solid #222;border-radius:8px;padding:12px;width:180px;flex-shrink:0;">' +
            '<div style="color:#666;font-size:9px;margin-bottom:8px;text-transform:uppercase;">Preview</div>' +
            '<div style="display:flex;flex-direction:column;gap:6px;">' +
                '<div style="display:flex;align-items:center;gap:6px;">' +
                    '<div style="width:12px;height:12px;border:1px solid #333;border-radius:2px;background:#22c55e;display:flex;align-items:center;justify-content:center;">' +
                        '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
                    '</div>' +
                    '<span style="color:#888;font-size:9px;">Linhas simples</span>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:6px;">' +
                    '<div style="width:12px;height:12px;border:1px solid #333;border-radius:2px;background:#22c55e;display:flex;align-items:center;justify-content:center;">' +
                        '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
                    '</div>' +
                    '<span style="color:#888;font-size:9px;">Culling</span>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:6px;">' +
                    '<div style="width:12px;height:12px;border:1px solid #333;border-radius:2px;"></div>' +
                    '<span style="color:#555;font-size:9px;">Alta prioridade</span>' +
                '</div>' +
            '</div>' +
            '<div style="margin-top:10px;padding-top:8px;border-top:1px solid #1a1a1a;display:flex;gap:6px;">' +
                '<div style="flex:1;padding:4px;background:#1a1a1a;border-radius:4px;text-align:center;color:#666;font-size:8px;">Exportar</div>' +
                '<div style="flex:1;padding:4px;background:#1a1a1a;border-radius:4px;text-align:center;color:#666;font-size:8px;">Importar</div>' +
            '</div>' +
        '</div>';
    }

    // Preview minimalista do painel Pro
    function getProPreview() {
        return '<div style="background:#0a0a0a;border:1px solid #222;border-radius:8px;padding:12px;width:180px;flex-shrink:0;">' +
            '<div style="color:#666;font-size:9px;margin-bottom:10px;text-transform:uppercase;">Preview</div>' +
            // Preview do nick com badge
            '<div style="text-align:center;padding:14px 10px;background:#111;border-radius:6px;border:1px solid #1a1a1a;margin-bottom:10px;">' +
                '<div style="display:inline-flex;align-items:center;gap:5px;">' +
                    '<span style="background:linear-gradient(90deg,#f59e0b,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:13px;font-weight:600;">snow</span>' +
                    '<svg width="12" height="12" viewBox="0 0 22 22" fill="#3b82f6"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z"/><path d="M15 9l-4.5 4.5L8 11" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                '</div>' +
            '</div>' +
            // Seletores de cor
            '<div style="display:flex;gap:8px;margin-bottom:10px;">' +
                '<div style="flex:1;background:#111;border-radius:6px;padding:8px;">' +
                    '<div style="color:#666;font-size:8px;margin-bottom:4px;">NICK</div>' +
                    '<div style="display:flex;gap:4px;">' +
                        '<div style="width:16px;height:16px;background:#f59e0b;border-radius:3px;border:1px solid #333;"></div>' +
                        '<div style="width:16px;height:16px;background:#ef4444;border-radius:3px;border:1px solid #333;"></div>' +
                    '</div>' +
                '</div>' +
                '<div style="flex:1;background:#111;border-radius:6px;padding:8px;">' +
                    '<div style="color:#666;font-size:8px;margin-bottom:4px;">BADGE</div>' +
                    '<div style="display:flex;gap:4px;">' +
                        '<div style="width:16px;height:16px;background:#3b82f6;border-radius:3px;border:1px solid #333;"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            // Banner
            '<div style="padding:8px;background:linear-gradient(90deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2));border-radius:6px;border:1px solid rgba(99,102,241,0.3);">' +
                '<div style="display:flex;align-items:center;gap:6px;">' +
                    '<span style="background:linear-gradient(90deg,#f59e0b,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:10px;font-weight:500;">snow</span>' +
                    '<svg width="8" height="8" viewBox="0 0 22 22" fill="#3b82f6"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z"/></svg>' +
                '</div>' +
            '</div>' +
            // Botão salvar
            '<div style="margin-top:10px;padding:8px;background:#fff;border-radius:6px;text-align:center;color:#000;font-size:10px;font-weight:600;">Salvar</div>' +
        '</div>';
    }

    // Preview minimalista do painel de Equipe
    function getTeamPreview() {
        return '<div style="background:#0a0a0a;border:1px solid #222;border-radius:8px;padding:12px;width:180px;flex-shrink:0;">' +
            '<div style="color:#666;font-size:9px;margin-bottom:10px;text-transform:uppercase;">Preview</div>' +
            // Header da equipe
            '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:#111;border-radius:6px;border:1px solid #1a1a1a;margin-bottom:10px;">' +
                '<div style="width:32px;height:32px;background:#1a1a1a;border-radius:4px;display:flex;align-items:center;justify-content:center;">' +
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                '</div>' +
                '<div>' +
                    '<div style="color:#fff;font-size:11px;font-weight:600;">Tigers</div>' +
                    '<div style="color:#555;font-size:9px;margin-top:2px;">3 ' + (currentLang === 'es' ? 'miembros' : 'membros') + '</div>' +
                '</div>' +
            '</div>' +
            // Preview da lista de jogadores com badge
            '<div style="padding:8px;background:#111;border-radius:6px;margin-bottom:10px;">' +
                '<div style="color:#666;font-size:8px;margin-bottom:6px;">' + (currentLang === 'es' ? 'LISTA DE JUGADORES' : 'LISTA DE JOGADORES') + '</div>' +
                '<div style="display:flex;flex-direction:column;gap:6px;">' +
                    '<div style="display:flex;align-items:center;gap:4px;padding:4px 6px;background:#1a1a1a;border-radius:4px;">' +
                        '<span style="color:#fff;font-size:10px;">z1co</span>' +
                        '<svg width="10" height="10" viewBox="0 0 22 22" fill="#3b82f6"><path d="M20.4 11c0-1.2-.7-2.3-1.8-2.9.4-1.2.2-2.5-.7-3.4-.9-.9-2.2-1.1-3.4-.7C14 2.9 12.9 2.2 11.7 2.2c-1.2 0-2.3.7-2.9 1.8-1.2-.4-2.5-.2-3.4.7-.9.9-1.1 2.2-.7 3.4C3.6 8.7 2.9 9.8 2.9 11c0 1.2.7 2.3 1.8 2.9-.4 1.2-.2 2.5.7 3.4.9.9 2.2 1.1 3.4.7.6 1.1 1.7 1.8 2.9 1.8 1.2 0 2.3-.7 2.9-1.8 1.2.4 2.5.2 3.4-.7.9-.9 1.1-2.2.7-3.4 1.1-.6 1.7-1.7 1.7-2.9z"/><path d="M15 9l-4.5 4.5L8 11" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                        '<svg width="10" height="10" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:4px;padding:4px 6px;background:#1a1a1a;border-radius:4px;">' +
                        '<span style="color:#fff;font-size:10px;">dnts</span>' +
                        '<svg width="10" height="10" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:4px;padding:4px 6px;background:#1a1a1a;border-radius:4px;">' +
                        '<span style="color:#fff;font-size:10px;">pedy</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            // Lista de membros da equipe
            '<div style="padding:8px;background:#111;border-radius:6px;">' +
                '<div style="color:#666;font-size:8px;margin-bottom:6px;">' + (currentLang === 'es' ? 'MIEMBROS' : 'MEMBROS') + '</div>' +
                '<div style="display:flex;flex-direction:column;gap:4px;">' +
                    '<div style="display:flex;align-items:center;gap:6px;">' +
                        '<span style="color:#ccc;font-size:9px;">z1co</span>' +
                        '<svg width="10" height="10" viewBox="0 0 576 512" fill="#F4A261"><path d="M309 106c11.4-7 19-19.7 19-34c0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34L209.7 220.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24c0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40c.2 0 .5 0 .7 0L86 427.4c5.5 30.4 32 52.6 63 52.6H427c31 0 57.4-22.2 63-52.6L535.3 176c.2 0 .5 0 .7 0c22.1 0 40-17.9 40-40s-17.9-40-40-40s-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z"/></svg>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:6px;">' +
                        '<span style="color:#ccc;font-size:9px;">dnts</span>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:6px;">' +
                        '<span style="color:#ccc;font-size:9px;">pedy</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function getPages() {
        return [
            {
                title: t('welcomeTitle'),
                content: t('welcomeText'),
                type: 'text'
            },
            {
                title: t('langTitle'),
                content: t('langText'),
                type: 'language'
            },
            {
                title: t('perfTitle'),
                content: t('perfText') + createListHTML(t('perfItems'), true) + '<div style="margin-top:16px;color:#666;">' + t('perfFooter') + '</div>',
                type: 'perf'
            },
            {
                title: t('fixesTitle'),
                content: t('fixesText') + createListHTML(t('fixesItems'), false),
                type: 'text'
            },
            {
                title: t('additionsTitle'),
                content: t('additionsText') + createListHTML(t('additionsItems'), false),
                type: 'text'
            },
            {
                title: t('proTitle'),
                content: t('proText') + createListHTML(t('proItems'), false) + '<div style="margin-top:16px;color:#666;font-size:11px;">' + t('proFooter') + '</div>',
                type: 'pro'
            },
            {
                title: t('teamTitle'),
                content: t('teamText') + createListHTML(t('teamItems'), false) + '<div style="margin-top:16px;color:#666;font-size:11px;">' + t('teamFooter') + '</div>',
                type: 'team'
            },
            {
                title: t('thanksTitle'),
                content: t('thanksText') + createListHTML(t('thanksItems'), false),
                type: 'text'
            }
        ];
    }

    function createWelcomePopup() {
        if (document.getElementById('welcome-popup-overlay')) return;

        var overlay = document.createElement('div');
        overlay.id = 'welcome-popup-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:10002;display:flex;align-items:center;justify-content:center;';

        var popup = document.createElement('div');
        popup.id = 'welcome-popup';
        popup.style.cssText = 'background:#111;border:1px solid #252525;border-radius:12px;max-width:95vw;overflow:hidden;';

        function renderPage(index) {
            var pages = getPages();
            var page = pages[index];
            var isFirst = index === 0;
            var isLast = index === pages.length - 1;

            var contentHTML = '';
            var previewHTML = '';
            
            if (page.type === 'language') {
                contentHTML = '<div style="color:#888;font-size:13px;line-height:1.7;">' + page.content + '</div>' +
                    '<div style="display:flex;gap:12px;margin-top:24px;">' +
                        '<button id="lang-pt" style="flex:1;padding:14px;background:' + (currentLang === 'pt' ? '#fff' : '#1a1a1a') + ';border:1px solid ' + (currentLang === 'pt' ? '#fff' : '#333') + ';border-radius:8px;color:' + (currentLang === 'pt' ? '#000' : '#888') + ';font-size:13px;font-weight:' + (currentLang === 'pt' ? '600' : '400') + ';cursor:pointer;">' + t('portuguese') + '</button>' +
                        '<button id="lang-es" style="flex:1;padding:14px;background:' + (currentLang === 'es' ? '#fff' : '#1a1a1a') + ';border:1px solid ' + (currentLang === 'es' ? '#fff' : '#333') + ';border-radius:8px;color:' + (currentLang === 'es' ? '#000' : '#888') + ';font-size:13px;font-weight:' + (currentLang === 'es' ? '600' : '400') + ';cursor:pointer;">' + t('spanish') + '</button>' +
                    '</div>';
            } else if (page.type === 'perf') {
                contentHTML = '<div style="color:#888;font-size:13px;line-height:1.7;">' + page.content + '</div>';
                previewHTML = getPerfPreview();
            } else if (page.type === 'team') {
                contentHTML = '<div style="color:#888;font-size:13px;line-height:1.7;">' + page.content + '</div>';
                previewHTML = getTeamPreview();
            } else if (page.type === 'pro') {
                contentHTML = '<div style="color:#888;font-size:13px;line-height:1.7;">' + page.content + '</div>';
                previewHTML = getProPreview();
            } else {
                contentHTML = '<div style="color:#888;font-size:13px;line-height:1.7;">' + page.content + '</div>';
            }

            var bodyHTML = previewHTML 
                ? '<div style="display:flex;gap:20px;align-items:flex-start;">' +
                    '<div style="flex:1;">' + contentHTML + '</div>' +
                    previewHTML +
                  '</div>'
                : contentHTML;

            popup.innerHTML =
                '<div style="padding:20px 24px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;">' +
                    '<span style="color:#fff;font-size:17px;font-weight:600;">' + page.title + '</span>' +
                    '<span style="color:#444;font-size:11px;">' + (index + 1) + ' / ' + pages.length + '</span>' +
                '</div>' +
                '<div style="padding:24px;">' + bodyHTML + '</div>' +
                '<div style="padding:16px 24px;border-top:1px solid #222;display:flex;justify-content:space-between;align-items:center;">' +
                    '<button id="welcome-prev" style="padding:10px 18px;background:' + (isFirst ? 'transparent' : '#1a1a1a') + ';border:none;border-radius:6px;color:' + (isFirst ? '#333' : '#999') + ';font-size:12px;cursor:' + (isFirst ? 'default' : 'pointer') + ';display:flex;align-items:center;gap:6px;"' + (isFirst ? ' disabled' : '') + '>' +
                        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>' +
                        t('prev') +
                    '</button>' +
                    '<button id="welcome-next" style="padding:10px 18px;background:#fff;border:none;border-radius:6px;color:#000;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">' +
                        (isLast ? t('start') : t('next')) +
                        (isLast ? '' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>') +
                    '</button>' +
                '</div>';

            popup.querySelector('#welcome-prev').onclick = function() {
                if (index > 0) {
                    currentPage--;
                    renderPage(currentPage);
                }
            };

            popup.querySelector('#welcome-next').onclick = function() {
                if (isLast) {
                    closeWelcomePopup();
                } else {
                    currentPage++;
                    renderPage(currentPage);
                }
            };

            if (page.type === 'language') {
                popup.querySelector('#lang-pt').onclick = function() {
                    if (currentLang !== 'pt') {
                        currentLang = 'pt';
                        localStorage.setItem('haxball_language', 'pt');
                        currentPage = 0;
                        renderPage(currentPage);
                    }
                };
                popup.querySelector('#lang-es').onclick = function() {
                    if (currentLang !== 'es') {
                        currentLang = 'es';
                        localStorage.setItem('haxball_language', 'es');
                        currentPage = 0;
                        renderPage(currentPage);
                    }
                };
            }
        }

        renderPage(0);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    }

    function closeWelcomePopup() {
        var overlay = document.getElementById('welcome-popup-overlay');
        if (overlay) overlay.remove();
        // Marca como visto ao fechar
        localStorage.setItem('haxball_welcome_seen', CURRENT_VERSION);
    }

    window.__showWelcomePopup = createWelcomePopup;
    window.__closeWelcomePopup = closeWelcomePopup;

    // Mostra o popup ao carregar (apenas se não viu essa versão)
    Injector.waitForElement('body').then(function() {
        var seenVersion = localStorage.getItem('haxball_welcome_seen');
        if (seenVersion !== CURRENT_VERSION) {
            setTimeout(createWelcomePopup, 800);
        }
    });
})();
