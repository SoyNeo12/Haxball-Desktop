// ============================================
// TRANSLATE - Sistema de tradução multi-idioma
// ============================================
(function() {
    if (Injector.isMainFrame()) return;

    // Idiomas disponíveis: 'pt' (português), 'es' (espanhol)
    var LANG_KEY = 'haxball_language';
    
    // Obtém idioma salvo ou detecta automaticamente
    function getLanguage() {
        var saved = localStorage.getItem(LANG_KEY);
        if (saved && (saved === 'pt' || saved === 'es')) return saved;
        
        // Detecta pelo navegador
        var browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        if (browserLang.indexOf('es') === 0) return 'es';
        return 'pt'; // Padrão: português
    }

    function setLanguage(lang) {
        localStorage.setItem(LANG_KEY, lang);
        window.__haxLang = lang;
    }

    var currentLang = getLanguage();
    window.__haxLang = currentLang;
    window.__haxSetLanguage = setLanguage;
    window.__haxGetLanguage = getLanguage;

    // Traduções: chave em inglês -> { pt: 'português', es: 'español' }
    var TRANSLATIONS = {
        // === HAXBALL ORIGINAL ===
        'Name': { pt: 'Nome', es: 'Nombre' },
        'Players': { pt: 'Jogadores', es: 'Jugadores' },
        'Distance': { pt: 'País', es: 'País' },
        'Pass': { pt: 'Senha', es: 'Contraseña' },
        'Room list': { pt: 'Lista de Salas', es: 'Lista de Salas' },
        'Refresh': { pt: 'Atualizar', es: 'Actualizar' },
        'Ok': { pt: 'Ok', es: 'Ok' },
        'Cancel': { pt: 'Cancelar', es: 'Cancelar' },
        'Create Room': { pt: 'Criar sala', es: 'Crear sala' },
        'Join Room': { pt: 'Entrar', es: 'Entrar' },
        'Settings': { pt: 'Configurações', es: 'Configuración' },
        'Leave': { pt: 'Sair', es: 'Salir' },
        'Replays': { pt: 'Replays', es: 'Replays' },
        'Room name': { pt: 'Nome da sala', es: 'Nombre de la sala' },
        'Password': { pt: 'Senha', es: 'Contraseña' },
        'Max players': { pt: 'Máx. jogadores', es: 'Máx. jugadores' },
        'Public': { pt: 'Pública', es: 'Pública' },
        'Unlock': { pt: 'Desbloquear', es: 'Desbloquear' },
        'Lock': { pt: 'Bloquear', es: 'Bloquear' },
        'Change': { pt: 'Alterar', es: 'Cambiar' },
        'Close': { pt: 'Fechar', es: 'Cerrar' },
        'Sound': { pt: 'Som', es: 'Sonido' },
        'Video': { pt: 'Vídeo', es: 'Video' },
        'Input': { pt: 'Teclas', es: 'Teclas' },
        'Misc': { pt: 'Outros', es: 'Otros' },

        // === EXTENSÃO - HEADER ===
        'Cole o link da sala aqui...': { pt: 'Cole o link da sala aqui...', es: 'Pega el enlace de la sala aquí...' },
        'Modo Anônimo': { pt: 'Modo Anônimo', es: 'Modo Anónimo' },
        'Esconder header': { pt: 'Esconder header', es: 'Ocultar header' },

        // === EXTENSÃO - ROOMLIST ===
        'Pesquisar salas...': { pt: 'Pesquisar salas...', es: 'Buscar salas...' },
        'Atualizar': { pt: 'Atualizar', es: 'Actualizar' },
        'Entrar': { pt: 'Entrar', es: 'Entrar' },
        'Criar Sala': { pt: 'Criar Sala', es: 'Crear Sala' },
        'Favoritos': { pt: 'Favoritos', es: 'Favoritos' },
        'Amizades': { pt: 'Amizades', es: 'Amistades' },
        'Equipe': { pt: 'Equipe', es: 'Equipo' },
        'Configurações': { pt: 'Configurações', es: 'Configuración' },
        'Voltar': { pt: 'Voltar', es: 'Volver' },
        'Fixar no Topo': { pt: 'Fixar no Topo', es: 'Fijar Arriba' },
        'Desafixar Sala': { pt: 'Desafixar Sala', es: 'Desfijar Sala' },
        'Adicionar aos Favoritos': { pt: 'Adicionar aos Favoritos', es: 'Añadir a Favoritos' },
        'Remover dos Favoritos': { pt: 'Remover dos Favoritos', es: 'Quitar de Favoritos' },
        'Todos os países': { pt: 'Todos os países', es: 'Todos los países' },
        'Limpar filtro': { pt: 'Limpar filtro', es: 'Limpiar filtro' },

        // === EXTENSÃO - TEAMS ===
        'Carregando...': { pt: 'Carregando...', es: 'Cargando...' },
        'Você não está em nenhuma equipe': { pt: 'Você não está em nenhuma equipe', es: 'No estás en ningún equipo' },
        'Criar Equipe': { pt: 'Criar Equipe', es: 'Crear Equipo' },
        'Criar Nova Equipe': { pt: 'Criar Nova Equipe', es: 'Crear Nuevo Equipo' },
        'Nome da Equipe': { pt: 'Nome da Equipe', es: 'Nombre del Equipo' },
        'Logo da Equipe': { pt: 'Logo da Equipe', es: 'Logo del Equipo' },
        'Escolher Imagem': { pt: 'Escolher Imagem', es: 'Elegir Imagen' },
        'Nenhuma selecionada': { pt: 'Nenhuma selecionada', es: 'Ninguna seleccionada' },
        'Preview': { pt: 'Preview', es: 'Vista previa' },
        'Cancelar': { pt: 'Cancelar', es: 'Cancelar' },
        'Criar': { pt: 'Criar', es: 'Crear' },
        'Criando...': { pt: 'Criando...', es: 'Creando...' },
        'Enviando logo...': { pt: 'Enviando logo...', es: 'Enviando logo...' },
        'Erro ao criar equipe': { pt: 'Erro ao criar equipe', es: 'Error al crear equipo' },
        'Erro de conexão': { pt: 'Erro de conexão', es: 'Error de conexión' },
        'membro(s)': { pt: 'membro(s)', es: 'miembro(s)' },
        'Sigla (máx 4)': { pt: 'Sigla (máx 4)', es: 'Sigla (máx 4)' },
        'Logo': { pt: 'Logo', es: 'Logo' },
        'Trocar': { pt: 'Trocar', es: 'Cambiar' },
        'Enviar': { pt: 'Enviar', es: 'Enviar' },
        'Salvar Alterações': { pt: 'Salvar Alterações', es: 'Guardar Cambios' },
        'Convidar Membro': { pt: 'Convidar Membro', es: 'Invitar Miembro' },
        'Username do Discord': { pt: 'Username do Discord', es: 'Usuario de Discord' },
        'Convidar': { pt: 'Convidar', es: 'Invitar' },
        'Membros': { pt: 'Membros', es: 'Miembros' },
        'Excluir Equipe': { pt: 'Excluir Equipe', es: 'Eliminar Equipo' },
        'Sair da Equipe': { pt: 'Sair da Equipe', es: 'Salir del Equipo' },
        'Nenhum membro': { pt: 'Nenhum membro', es: 'Ningún miembro' },
        'Remover': { pt: 'Remover', es: 'Eliminar' },
        'Convites Pendentes': { pt: 'Convites Pendentes', es: 'Invitaciones Pendientes' },
        'Aceitar': { pt: 'Aceitar', es: 'Aceptar' },
        'Recusar': { pt: 'Recusar', es: 'Rechazar' },
        'Convite enviado!': { pt: 'Convite enviado!', es: '¡Invitación enviada!' },
        'Erro ao convidar': { pt: 'Erro ao convidar', es: 'Error al invitar' },
        'Salvando...': { pt: 'Salvando...', es: 'Guardando...' },
        'Alterações salvas!': { pt: 'Alterações salvas!', es: '¡Cambios guardados!' },
        'Erro ao salvar': { pt: 'Erro ao salvar', es: 'Error al guardar' },
        'Pronto pra salvar': { pt: 'Pronto pra salvar', es: 'Listo para guardar' },
        'Máximo 512KB': { pt: 'Máximo 512KB', es: 'Máximo 512KB' },
        'Imagem muito grande (máx 512KB)': { pt: 'Imagem muito grande (máx 512KB)', es: 'Imagen muy grande (máx 512KB)' },
        'Nome deve ter pelo menos 3 caracteres': { pt: 'Nome deve ter pelo menos 3 caracteres', es: 'El nombre debe tener al menos 3 caracteres' },
        'Fechar': { pt: 'Fechar', es: 'Cerrar' },
        'Remover este membro?': { pt: 'Remover este membro?', es: '¿Eliminar este miembro?' },
        'Confirmar': { pt: 'Confirmar', es: 'Confirmar' },
        'Tem certeza que deseja EXCLUIR a equipe? Isso não pode ser desfeito.': { pt: 'Tem certeza que deseja EXCLUIR a equipe? Isso não pode ser desfeito.', es: '¿Estás seguro de que deseas ELIMINAR el equipo? Esto no se puede deshacer.' },
        'Tem certeza que deseja sair da equipe?': { pt: 'Tem certeza que deseja sair da equipe?', es: '¿Estás seguro de que deseas salir del equipo?' },

        // === EXTENSÃO - FRIENDS ===
        'Amigos': { pt: 'Amigos', es: 'Amigos' },
        'Amizades': { pt: 'Amizades', es: 'Amistades' },
        'Adicionar Amigo': { pt: 'Adicionar Amigo', es: 'Añadir Amigo' },
        'Nenhum amigo adicionado': { pt: 'Nenhum amigo adicionado', es: 'Ningún amigo añadido' },
        'Online': { pt: 'Online', es: 'En línea' },
        'Offline': { pt: 'Offline', es: 'Desconectado' },
        'Solicitações': { pt: 'Solicitações', es: 'Solicitudes' },
        'Username do Discord': { pt: 'Username do Discord', es: 'Usuario de Discord' },
        'Nenhum usuário encontrado': { pt: 'Nenhum usuário encontrado', es: 'Ningún usuario encontrado' },
        'Adicionar': { pt: 'Adicionar', es: 'Añadir' },
        'Solicitação enviada para': { pt: 'Solicitação enviada para', es: 'Solicitud enviada a' },
        'Erro ao enviar': { pt: 'Erro ao enviar', es: 'Error al enviar' },
        'Digite um username': { pt: 'Digite um username', es: 'Escribe un usuario' },
        'Buscando...': { pt: 'Buscando...', es: 'Buscando...' },
        'Usuário não encontrado': { pt: 'Usuário não encontrado', es: 'Usuario no encontrado' },
        'Erro ao buscar usuário': { pt: 'Erro ao buscar usuário', es: 'Error al buscar usuario' },
        'Solicitações pendentes': { pt: 'Solicitações pendentes', es: 'Solicitudes pendientes' },
        'Entrar': { pt: 'Entrar', es: 'Entrar' },
        'Compartilhar': { pt: 'Compartilhar', es: 'Compartir' },
        'Compartilhado!': { pt: 'Compartilhado!', es: '¡Compartido!' },
        'Erro': { pt: 'Erro', es: 'Error' },

        // === EXTENSÃO - SETTINGS ===
        'Som': { pt: 'Som', es: 'Sonido' },
        'Vídeo': { pt: 'Vídeo', es: 'Video' },
        'Controles': { pt: 'Controles', es: 'Controles' },
        'Avatares': { pt: 'Avatares', es: 'Avatares' },
        'Host Token': { pt: 'Host Token', es: 'Host Token' },
        'Temas': { pt: 'Temas', es: 'Temas' },
        'Multi-Auth': { pt: 'Multi-Auth', es: 'Multi-Auth' },
        'Diversos': { pt: 'Diversos', es: 'Varios' },

        // === EXTENSÃO - MULTI-AUTH ===
        'Auth atual: ': { pt: 'Auth atual: ', es: 'Auth actual: ' },
        'Nenhuma auth ativa. Máximo de 5 auths.': { pt: 'Nenhuma auth ativa. Máximo de 5 auths.', es: 'Ninguna auth activa. Máximo de 5 auths.' },
        'Nenhuma auth salva. Adicione uma abaixo.': { pt: 'Nenhuma auth salva. Adicione uma abaixo.', es: 'Ninguna auth guardada. Añade una abajo.' },
        'Auth ': { pt: 'Auth ', es: 'Auth ' },
        'Usar': { pt: 'Usar', es: 'Usar' },
        'Auth alterada! Feche e abra o app para aplicar.': { pt: 'Auth alterada! Feche e abra o app para aplicar.', es: '¡Auth cambiada! Cierra y abre la app para aplicar.' },
        'Auth removida': { pt: 'Auth removida', es: 'Auth eliminada' },
        'Adicionar Nova Auth': { pt: 'Adicionar Nova Auth', es: 'Añadir Nueva Auth' },
        'Nome (opcional)': { pt: 'Nome (opcional)', es: 'Nombre (opcional)' },
        'Auth Key (ex: idkey.xxx.xxx.xxx)': { pt: 'Auth Key (ex: idkey.xxx.xxx.xxx)', es: 'Auth Key (ej: idkey.xxx.xxx.xxx)' },
        'Adicionar': { pt: 'Adicionar', es: 'Añadir' },
        'Salvar Atual': { pt: 'Salvar Atual', es: 'Guardar Actual' },
        'Digite uma auth key': { pt: 'Digite uma auth key', es: 'Escribe una auth key' },
        'Formato inválido. Use: idkey.xxx.xxx.xxx': { pt: 'Formato inválido. Use: idkey.xxx.xxx.xxx', es: 'Formato inválido. Usa: idkey.xxx.xxx.xxx' },
        'Esta auth já está salva': { pt: 'Esta auth já está salva', es: 'Esta auth ya está guardada' },
        'Limite de 5 auths atingido': { pt: 'Limite de 5 auths atingido', es: 'Límite de 5 auths alcanzado' },
        'Auth adicionada!': { pt: 'Auth adicionada!', es: '¡Auth añadida!' },
        'Nenhuma auth atual para salvar': { pt: 'Nenhuma auth atual para salvar', es: 'Ninguna auth actual para guardar' },
        'Auth atual já está salva': { pt: 'Auth atual já está salva', es: 'Auth actual ya está guardada' },
        'Auth atual salva!': { pt: 'Auth atual salva!', es: '¡Auth actual guardada!' },
        'Após trocar de auth, feche e abra o app para aplicar.': { pt: 'Após trocar de auth, feche e abra o app para aplicar.', es: 'Después de cambiar de auth, cierra y abre la app para aplicar.' },

        'Tema': { pt: 'Tema', es: 'Tema' },
        'Escuro': { pt: 'Escuro', es: 'Oscuro' },
        'Claro': { pt: 'Claro', es: 'Claro' },
        'Padrão': { pt: 'Padrão', es: 'Predeterminado' },
        'Onix': { pt: 'Onix', es: 'Onix' },
        'Sem alterações de cor': { pt: 'Sem alterações de cor', es: 'Sin cambios de color' },
        'Reduz o cansaço visual': { pt: 'Reduz o cansaço visual', es: 'Reduce la fatiga visual' },
        'Melhor visibilidade': { pt: 'Melhor visibilidade', es: 'Mejor visibilidad' },
        'Preto total, escuridão absoluta': { pt: 'Preto total, escuridão absoluta', es: 'Negro total, oscuridad absoluta' },

        // === EXTENSÃO - SETTINGS (game-min.js) ===
        'Desempenho': { pt: 'Desempenho', es: 'Rendimiento' },
        'Ative as opções para melhorar o FPS.': { pt: 'Ative as opções para melhorar o FPS.', es: 'Activa las opciones para mejorar el FPS.' },
        'Linhas simplificadas': { pt: 'Linhas simplificadas', es: 'Líneas simplificadas' },
        'Reduz a espessura das linhas do campo de 3px para 1px. Menos pixels para desenhar.': { pt: 'Reduz a espessura das linhas do campo de 3px para 1px. Menos pixels para desenhar.', es: 'Reduce el grosor de las líneas del campo de 3px a 1px. Menos píxeles para dibujar.' },
        'Curvas viram retas': { pt: 'Curvas viram retas', es: 'Curvas se vuelven rectas' },
        'Converte todas as linhas curvas em retas. Desenhar retas é muito mais rápido que arcos.': { pt: 'Converte todas as linhas curvas em retas. Desenhar retas é muito mais rápido que arcos.', es: 'Convierte todas las líneas curvas en rectas. Dibujar rectas es mucho más rápido que arcos.' },
        'Culling de viewport': { pt: 'Culling de viewport', es: 'Culling de viewport' },
        'Não desenha objetos fora da tela. Em mapas grandes, evita renderizar o que você não vê.': { pt: 'Não desenha objetos fora da tela. Em mapas grandes, evita renderizar o que você não vê.', es: 'No dibuja objetos fuera de la pantalla. En mapas grandes, evita renderizar lo que no ves.' },
        'Desativar avatares e cores': { pt: 'Desativar avatares e cores', es: 'Desactivar avatares y colores' },
        'Remove avatares personalizados e usa cores padrão dos times. Menos texturas.': { pt: 'Remove avatares personalizados e usa cores padrão dos times. Menos texturas.', es: 'Elimina avatares personalizados y usa colores estándar de los equipos. Menos texturas.' },
        'Desativar nomes': { pt: 'Desativar nomes', es: 'Desactivar nombres' },
        'Esconde os nomes dos jogadores. Menos texto para renderizar.': { pt: 'Esconde os nomes dos jogadores. Menos texto para renderizar.', es: 'Oculta los nombres de los jugadores. Menos texto para renderizar.' },
        'Campo simplificado': { pt: 'Campo simplificado', es: 'Campo simplificado' },
        'Usa cores sólidas no campo ao invés de gradientes. Renderização mais simples.': { pt: 'Usa cores sólidas no campo ao invés de gradientes. Renderização mais simples.', es: 'Usa colores sólidos en el campo en lugar de degradados. Renderizado más simple.' },
        'Círculos de baixa qualidade': { pt: 'Círculos de baixa qualidade', es: 'Círculos de baja calidad' },
        'Pré-renderiza os círculos. Mais rápido mas visual pixelado.': { pt: 'Pré-renderiza os círculos. Mais rápido mas visual pixelado.', es: 'Pre-renderiza los círculos. Más rápido pero visual pixelado.' },
        'Gráficos brutos': { pt: 'Gráficos brutos', es: 'Gráficos crudos' },
        'Desativa suavização de imagens. Visual mais pixelado mas processamento mais rápido.': { pt: 'Desativa suavização de imagens. Visual mais pixelado mas processamento mais rápido.', es: 'Desactiva el suavizado de imágenes. Visual más pixelado pero procesamiento más rápido.' },
        'Desativar animações de gol': { pt: 'Desativar animações de gol', es: 'Desactivar animaciones de gol' },
        'Remove as animações quando um gol é marcado. Evita quedas de FPS momentâneas.': { pt: 'Remove as animações quando um gol é marcado. Evita quedas de FPS momentâneas.', es: 'Elimina las animaciones cuando se marca un gol. Evita caídas de FPS momentáneas.' },
        'Desativar indicador do jogador': { pt: 'Desativar indicador do jogador', es: 'Desactivar indicador del jugador' },
        'A seta que mostra onde você está. Economiza um pouco de renderização.': { pt: 'A seta que mostra onde você está. Economiza um pouco de renderização.', es: 'La flecha que muestra dónde estás. Ahorra un poco de renderizado.' },
        'Desativar indicador de chat': { pt: 'Desativar indicador de chat', es: 'Desactivar indicador de chat' },
        'O balão que aparece quando alguém fala. Remove essa renderização extra.': { pt: 'O balão que aparece quando alguém fala. Remove essa renderização extra.', es: 'El globo que aparece cuando alguien habla. Elimina ese renderizado extra.' },
        'Alta prioridade': { pt: 'Alta prioridade', es: 'Alta prioridad' },
        'Dá mais recursos do sistema para o jogo. Pode travar outros programas. Use com cuidado!': { pt: 'Dá mais recursos do sistema para o jogo. Pode travar outros programas. Use com cuidado!', es: 'Da más recursos del sistema al juego. Puede bloquear otros programas. ¡Usa con cuidado!' },
        'Cuidado': { pt: 'Cuidado', es: 'Cuidado' },
        'Mostrar nomes dos jogadores': { pt: 'Mostrar nomes dos jogadores', es: 'Mostrar nombres de jugadores' },
        'Mostrar avatares e cores': { pt: 'Mostrar avatares e cores', es: 'Mostrar avatares y colores' },
        'Mostrar indicador do jogador': { pt: 'Mostrar indicador do jogador', es: 'Mostrar indicador del jugador' },
        'Mostrar animações de gol': { pt: 'Mostrar animações de gol', es: 'Mostrar animaciones de gol' },
        'Mostrar indicador de chat': { pt: 'Mostrar indicador de chat', es: 'Mostrar indicador de chat' },
        'Alta prioridade (pode travar o sistema)': { pt: 'Alta prioridade (pode travar o sistema)', es: 'Alta prioridad (puede bloquear el sistema)' },
        'Culling de viewport (não desenhar fora da tela)': { pt: 'Culling de viewport (não desenhar fora da tela)', es: 'Culling de viewport (no dibujar fuera de pantalla)' },

        // === EXTENSÃO - CHAT COMMANDS ===
        'Mutados:': { pt: 'Mutados:', es: 'Silenciados:' },
        'Nenhum jogador mutado': { pt: 'Nenhum jogador mutado', es: 'Ningún jugador silenciado' },

        // === EXTENSÃO - QUICK AVATAR ===
        'Defina teclas de atalho para trocar de avatar rapidamente durante o jogo.': { pt: 'Defina teclas de atalho para trocar de avatar rapidamente durante o jogo.', es: 'Define teclas de acceso rápido para cambiar de avatar rápidamente durante el juego.' },
        'Adicionar atalho': { pt: 'Adicionar atalho', es: 'Añadir atajo' },
        'Novo Atalho': { pt: 'Novo Atalho', es: 'Nuevo Atajo' },
        'Editar Atalho': { pt: 'Editar Atalho', es: 'Editar Atajo' },
        'Tecla de Atalho': { pt: 'Tecla de Atalho', es: 'Tecla de Atajo' },
        'Avatar (emoji ou texto)': { pt: 'Avatar (emoji ou texto)', es: 'Avatar (emoji o texto)' },
        'Clique para definir tecla': { pt: 'Clique para definir tecla', es: 'Haz clic para definir tecla' },
        'Pressione uma tecla...': { pt: 'Pressione uma tecla...', es: 'Presiona una tecla...' },
        'Tecla inválida, tente outra': { pt: 'Tecla inválida, tente outra', es: 'Tecla inválida, intenta otra' },
        'Editar': { pt: 'Editar', es: 'Editar' },
        'Salvar': { pt: 'Salvar', es: 'Guardar' },
        'vazio': { pt: 'vazio', es: 'vacío' },

        // === EXTENSÃO - HOST TOKEN ===
        'Configure seu host token para criar salas sem captcha.': { pt: 'Configure seu host token para criar salas sem captcha.', es: 'Configura tu host token para crear salas sin captcha.' },
        'Cole seu host token aqui': { pt: 'Cole seu host token aqui', es: 'Pega tu host token aquí' },
        'Limpar': { pt: 'Limpar', es: 'Limpiar' },

        // === EXTENSÃO - HIDE UI ===
        'Ocultar Chat': { pt: 'Ocultar Chat', es: 'Ocultar Chat' },
        'Ocultar Placar/Timer': { pt: 'Ocultar Placar/Timer', es: 'Ocultar Marcador/Tiempo' },
        'Ocultar Ping/FPS': { pt: 'Ocultar Ping/FPS', es: 'Ocultar Ping/FPS' },

        // === EXTENSÃO - PRO ===
        'Desbloqueie recursos exclusivos:': { pt: 'Desbloqueie recursos exclusivos:', es: 'Desbloquea recursos exclusivos:' },
        'Verificado automático': { pt: 'Verificado automático', es: 'Verificado automático' },
        'Cor personalizada do verificado': { pt: 'Cor personalizada do verificado', es: 'Color personalizado del verificado' },
        'Cor do nick na lista': { pt: 'Cor do nick na lista', es: 'Color del nick en la lista' },
        'Banners exclusivos na lista': { pt: 'Banners exclusivos na lista', es: 'Banners exclusivos en la lista' },
        'Banner Exclusivo': { pt: 'Banner Exclusivo', es: 'Banner Exclusivo' },
        'Fonte personalizada do nick': { pt: 'Fonte personalizada do nick', es: 'Fuente personalizada del nick' },
        'Fonte do Nick': { pt: 'Fonte do Nick', es: 'Fuente del Nick' },
        'Fonte': { pt: 'Fonte', es: 'Fuente' },
        'Banner': { pt: 'Banner', es: 'Banner' },
        'Cor do Nick': { pt: 'Cor do Nick', es: 'Color del Nick' },
        'Criar equipes': { pt: 'Criar equipes', es: 'Crear equipos' },
        'Suporte prioritário': { pt: 'Suporte prioritário', es: 'Soporte prioritario' },
        'Acesso antecipado às novidades': { pt: 'Acesso antecipado às novidades', es: 'Acceso anticipado a las novedades' },
        'Assinar Pro - $4/mês': { pt: 'Assinar Pro - $4/mês', es: 'Suscribirse Pro - $4/mes' },
        'Assinar por $4/mês': { pt: 'Assinar por $4/mês', es: 'Suscribirse por $4/mes' },
        'Adquirir com Boost': { pt: 'Adquirir com Boost', es: 'Obtener con Boost' },
        'Verificando...': { pt: 'Verificando...', es: 'Verificando...' },
        'PRO Ativado!': { pt: 'PRO Ativado!', es: '¡PRO Activado!' },
        'Faça logout e login novamente': { pt: 'Faça logout e login novamente', es: 'Cierra sesión e inicia sesión de nuevo' },
        'Dê boost no Discord primeiro': { pt: 'Dê boost no Discord primeiro', es: 'Da boost en Discord primero' },
        'Erro ao verificar': { pt: 'Erro ao verificar', es: 'Error al verificar' },
        'Pagamento seguro via Stripe': { pt: 'Pagamento seguro via Stripe', es: 'Pago seguro vía Stripe' },
        'Ativo': { pt: 'Ativo', es: 'Activo' },
        'Válido até': { pt: 'Válido até', es: 'Válido hasta' },
        'Vitalício': { pt: 'Vitalício', es: 'Vitalicio' },
        'Cor do Verificado': { pt: 'Cor do Verificado', es: 'Color del Verificado' },
        'Cor do Nick na Lista': { pt: 'Cor do Nick na Lista', es: 'Color del Nick en la Lista' },
        'Cor do nick na lista e chat': { pt: 'Cor do nick na lista e chat', es: 'Color del nick en la lista y chat' },
        'Cor do Nick na Lista e Chat': { pt: 'Cor do Nick na Lista e Chat', es: 'Color del Nick en la Lista y Chat' },
        'Preview': { pt: 'Preview', es: 'Vista previa' },
        'Salvando...': { pt: 'Salvando...', es: 'Guardando...' },
        'Salvo!': { pt: 'Salvo!', es: '¡Guardado!' },
        'Recurso Pro': { pt: 'Recurso Pro', es: 'Recurso Pro' },
        'Apenas usuários Pro podem criar equipes.': { pt: 'Apenas usuários Pro podem criar equipes.', es: 'Solo los usuarios Pro pueden crear equipos.' },
        'Personalização': { pt: 'Personalização', es: 'Personalización' },
        'Sincronizar cores (Nick → Verificado)': { pt: 'Sincronizar cores (Nick → Verificado)', es: 'Sincronizar colores (Nick → Verificado)' },
        'Sincronizado!': { pt: 'Sincronizado!', es: '¡Sincronizado!' },
        'Cores do banner:': { pt: 'Cores do banner:', es: 'Colores del banner:' },
        'Altere cores, fontes e gradientes do seu nick e chat. Destaque-se na lista de jogadores com banners exclusivos.': { pt: 'Altere cores, fontes e gradientes do seu nick e chat. Destaque-se na lista de jogadores com banners exclusivos.', es: 'Cambia colores, fuentes y gradientes de tu nick y chat. Destácate en la lista de jugadores con banners exclusivos.' },
        'Ganhe um selo de verificado único com a cor que você escolher.': { pt: 'Ganhe um selo de verificado único com a cor que você escolher.', es: 'Obtén un sello de verificado único con el color que elijas.' },
        'Monte sua própria equipe e jogue com amigos usando identidade visual única.': { pt: 'Monte sua própria equipe e jogue com amigos usando identidade visual única.', es: 'Arma tu propio equipo y juega con amigos usando identidad visual única.' },
        'Seja o primeiro a testar novos recursos antes de todo mundo.': { pt: 'Seja o primeiro a testar novos recursos antes de todo mundo.', es: 'Sé el primero en probar nuevos recursos antes que todos.' },
        'Sua assinatura ajuda a manter o aplicativo funcionando e evoluindo.': { pt: 'Sua assinatura ajuda a manter o aplicativo funcionando e evoluindo.', es: 'Tu suscripción ayuda a mantener la app funcionando y evolucionando.' },
        'Assinar por R$19,90/mês': { pt: 'Assinar por R$19,90/mês', es: 'Suscribirse por R$19,90/mes' },

        // === EXTENSÃO - STRETCHED ===
        'Esticar': { pt: 'Esticar', es: 'Estirar' },
        'Nativo': { pt: 'Nativo', es: 'Nativo' },

        // === GAME-MIN - QUALITY MODE ===
        'Quality Mode:': { pt: 'Qualidade:', es: 'Calidad:' },
        'Performance (90%)': { pt: 'Desempenho (90%)', es: 'Rendimiento (90%)' },
        'HD (100%)': { pt: 'HD (100%)', es: 'HD (100%)' }
    };

    // Função de tradução global
    function t(key) {
        var entry = TRANSLATIONS[key];
        if (!entry) return key;
        return entry[currentLang] || entry['pt'] || key;
    }

    // Exporta função de tradução
    window.__t = t;
    window.__TRANSLATIONS = TRANSLATIONS;

    function translateElement(el) {
        if (!el) return;
        
        // Ignora elementos que já foram traduzidos ou que são do sistema de compartilhamento
        if (el.dataset.translated || el.getAttribute('data-hook') === 'share-friends') return;
        
        // Só traduz se o elemento não tiver filhos elementos (apenas texto)
        if (el.children.length > 0) {
            // Se tem filhos, só traduz se for um texto direto sem elementos complexos
            var hasOnlyIconChild = el.children.length === 1 && el.children[0].tagName === 'I';
            if (!hasOnlyIconChild) return;
        }
        
        var text = el.textContent.trim();
        var entry = TRANSLATIONS[text];
        if (entry && entry[currentLang]) {
            // Preserva ícones se existirem
            var icon = el.querySelector('i');
            if (icon) {
                var iconClone = icon.cloneNode(true);
                el.textContent = entry[currentLang];
                el.insertBefore(iconClone, el.firstChild);
            } else {
                el.textContent = entry[currentLang];
            }
            el.dataset.translated = 'true';
        }
    }

    function translateAll(doc) {
        // Traduz headers da tabela
        var headers = doc.querySelectorAll('table.header td, th');
        for (var i = 0; i < headers.length; i++) {
            translateElement(headers[i]);
        }

        // Traduz botões
        var buttons = doc.querySelectorAll('button');
        for (var j = 0; j < buttons.length; j++) {
            translateElement(buttons[j]);
        }

        // Traduz títulos
        var titles = doc.querySelectorAll('h1, h2, h3');
        for (var k = 0; k < titles.length; k++) {
            translateElement(titles[k]);
        }

        // Traduz labels
        var labels = doc.querySelectorAll('label, span');
        for (var l = 0; l < labels.length; l++) {
            var text = labels[l].textContent.trim();
            var entry = TRANSLATIONS[text];
            if (entry && entry[currentLang]) {
                labels[l].textContent = entry[currentLang];
            }
        }
    }

    function init() {
        // Traduz inicialmente
        translateAll(document);

        // Usa o sistema de views do core (leve) - traduz quando qualquer view aparece
        if (Injector.isGameFrame()) {
            Injector.onView('view', function(el) {
                translateAll(el);
            });
            Injector.onView('dialog', function(el) {
                translateAll(el);
                // Traduz elementos específicos de settings
                translateSettingsDialog(el);
            });
            
            // Observer adicional para garantir tradução do settings
            var settingsObserver = new MutationObserver(function() {
                var settingsDialog = document.querySelector('.dialog.settings-view');
                if (settingsDialog && !settingsDialog.dataset.translated) {
                    settingsDialog.dataset.translated = 'true';
                    translateSettingsDialog(settingsDialog);
                }
                
                // Também traduz quando a aba misc é selecionada
                var miscSection = document.querySelector('[data-hook="miscsec"].selected');
                if (miscSection && !miscSection.dataset.translated) {
                    miscSection.dataset.translated = currentLang;
                    translateSettingsDialog(document);
                }
            });
            settingsObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        }
    }

    // Traduz elementos específicos do dialog de settings
    function translateSettingsDialog(el) {
        // Se não for espanhol, não precisa traduzir (já está em PT)
        if (currentLang !== 'es') return;

        // Usa document se el não tiver os elementos
        var root = el || document;

        // Mapeamento de data-hooks para traduções em espanhol
        var hookTranslations = {
            'tmisc-title': 'Rendimiento',
            'tmisc-shownames': 'Mostrar nombres de jugadores',
            'tmisc-showavatars': 'Mostrar avatares y colores',
            'tmisc-imgsmoothing': 'Gráficos crudos',
            'tmisc-showindicator': 'Mostrar indicador del jugador',
            'tmisc-simplelines': 'Líneas simplificadas',
            'tmisc-simplefield': 'Campo simplificado',
            'tmisc-showanimations': 'Mostrar animaciones de gol',
            'tmisc-showchat': 'Mostrar indicador de chat',
            'tmisc-highpriority': 'Alta prioridad (puede bloquear el sistema)',
            'tmisc-culling': 'Culling de viewport (no dibujar fuera de pantalla)',
            'hideui-chat': 'Ocultar Chat',
            'hideui-scoreboard': 'Ocultar Marcador/Tiempo',
            'hideui-pingfps': 'Ocultar Ping/FPS',
            'qualitymode-label': 'Calidad:'
        };

        // Traduz cada elemento pelo data-hook
        for (var hook in hookTranslations) {
            var hookEl = root.querySelector('[data-hook="' + hook + '"]');
            if (!hookEl) hookEl = document.querySelector('[data-hook="' + hook + '"]');
            if (hookEl) {
                // Verifica se tem ícone (checkbox visual) dentro
                var icon = hookEl.querySelector('i');
                if (icon) {
                    // Preserva o ícone - guarda a classe atual
                    var iconClass = icon.className;
                    // Remove apenas os nós de texto, mantém o ícone
                    var childNodes = hookEl.childNodes;
                    for (var i = childNodes.length - 1; i >= 0; i--) {
                        if (childNodes[i].nodeType === 3) { // TEXT_NODE
                            hookEl.removeChild(childNodes[i]);
                        }
                    }
                    // Adiciona o novo texto após o ícone
                    hookEl.appendChild(document.createTextNode(hookTranslations[hook]));
                } else {
                    hookEl.textContent = hookTranslations[hook];
                }
            }
        }

        // Traduz opções do select de qualidade
        var qualitySelect = root.querySelector('[data-hook="qualitymode"]');
        if (!qualitySelect) qualitySelect = document.querySelector('[data-hook="qualitymode"]');
        if (qualitySelect && qualitySelect.options) {
            for (var i = 0; i < qualitySelect.options.length; i++) {
                var opt = qualitySelect.options[i];
                if (opt.text === 'Desempenho') opt.text = 'Rendimiento';
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    Injector.log('Translate module loaded (lang: ' + currentLang + ')');
})();
