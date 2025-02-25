document.addEventListener('DOMContentLoaded', function() {
    // Inicializar contagem regressiva com efeito neon
    const eventDate = new Date('2025-03-08T15:30:00');
    
    function updateCountdown() {
        const now = new Date();
        const diff = eventDate - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
    
    setInterval(updateCountdown, 1000);
    updateCountdown();
    
    // Gerenciar etapas com transições suaves
    let currentStep = 1;
    const steps = document.querySelectorAll('.step');
    
    // Função para mostrar/esconder seções
    function showStep(step) {
        // Esconde todas as seções
        document.querySelectorAll('.step').forEach(s => {
            s.classList.remove('active');
            s.classList.remove('animate__fadeIn');
        });
        
        // Mostra a seção atual
        const currentStep = document.getElementById(`step${step}`);
        currentStep.classList.add('active');
        currentStep.classList.add('animate__fadeIn');
        
        // Timer só aparece na primeira tela
        const timer = document.querySelector('.countdown-timer');
        if (timer) {
            timer.style.display = step === 1 ? 'flex' : 'none';
        }
        
        // Seção de presentes só aparece na segunda tela
        const giftSection = document.querySelector('.gift-section');
        if (giftSection) {
            giftSection.style.display = step === 2 ? 'block' : 'none';
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Quiz do ultrassom com efeitos visuais
    const ultrasoundCards = document.querySelectorAll('.ultrasound-card');
    const quizResult = document.getElementById('quiz-result');
    
    ultrasoundCards.forEach(card => {
        card.addEventListener('click', function() {
            if (this.classList.contains('selected')) return;
            
            ultrasoundCards.forEach(c => {
                c.classList.remove('selected');
                c.style.transform = 'scale(1)';
            });
            
            this.classList.add('selected');
            this.style.transform = 'scale(1.05)';
            
            const isCorrect = this.getAttribute('data-correct') === 'true';
            quizResult.style.display = 'block';
            quizResult.className = 'quiz-result animate__animated';
            
            if (isCorrect) {
                quizResult.innerHTML = `
                    <div class="success-message">
                        <h3> Parabéns! 👶🎉</h3>
                        <p>Você encontrou a Helena!🩷 </p>
                    </div>
                `;
                quizResult.classList.add('animate__bounceIn');
                
                setTimeout(() => {
                    showStep(2);
                }, 2000);
            } else {
                quizResult.innerHTML = `
                    <div class="error-message">
                        <h3>Ops!</h3>
                        <p>Essa não é a Helena ❌❌. Tente novamente!  </p>
                    </div>
                `;
                quizResult.classList.add('animate__shakeX');
                
                setTimeout(() => {
                    quizResult.classList.add('animate__fadeOut');
                    setTimeout(() => {
                        quizResult.style.display = 'none';
                        quizResult.className = 'quiz-result';
                        this.classList.remove('selected');
                    }, 500);
                }, 1500);
            }
        });
    });
    
    // Checkbox de acompanhante
    const hasCompanionCheckbox = document.getElementById('hasCompanion');
    const companionSection = document.getElementById('companionSection');
    const guestsSelect = document.getElementById('guests');
    const companionNames = document.getElementById('companionNames');

    hasCompanionCheckbox.addEventListener('change', function() {
        companionSection.style.display = this.checked ? 'block' : 'none';
        if (this.checked) {
            guestsSelect.setAttribute('required', 'required');
        } else {
            guestsSelect.removeAttribute('required');
            guestsSelect.value = '';
            companionNames.value = '';
        }
    });

    // Formulário de confirmação de presença
    const rsvpForm = document.getElementById('rsvpForm');
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const hasCompanion = document.getElementById('hasCompanion').checked;
        const guests = document.getElementById('guests');
        const companionNames = document.getElementById('companionNames');
        const qtdeAcompanhantes = hasCompanion ? parseInt(guests.value) : 0;
        const nomesAcompanhantes = hasCompanion ? companionNames.value : '';

        // Verificar se uma fralda foi selecionada
        const selectedDiaperDiv = document.querySelector('.diaper-option.selected');
        if (!selectedDiaperDiv) {
            alert('Por favor, selecione uma fralda antes de confirmar sua presença.');
            return;
        }

        try {
            // 1. Inserir confirmação
            console.log('Dados da confirmação:', {
                nome: name,
                qtde_pessoas: qtdeAcompanhantes,
                nomes_acompanhantes: nomesAcompanhantes
            });

            const { data: confirmationData, error: confirmationError } = await supabase
                .from('confirmacoes')
                .insert([
                    { 
                        nome: name, 
                        qtde_pessoas: qtdeAcompanhantes,
                        nomes_acompanhantes: nomesAcompanhantes
                    }
                ]);

            if (confirmationError) {
                console.error('Erro na confirmação:', confirmationError);
                throw confirmationError;
            }

            // 2. Inserir reserva de fralda
            const diaperId = parseInt(selectedDiaperDiv.dataset.id);
            console.log('Dados da reserva:', {
                fralda_id: diaperId,
                nome: name,
                quantidade: 1
            });

            const { data: reservationData, error: reservationError } = await supabase
                .from('reservas_fraldas')
                .insert([
                    {
                        fralda_id: diaperId,
                        nome: name,
                        quantidade: 1
                    }
                ]);

            if (reservationError) {
                console.error('Erro na reserva:', reservationError);
                throw reservationError;
            }

            // 3. Primeiro, buscar a quantidade atual
            const { data: fralda, error: getFraldaError } = await supabase
                .from('fraldas')
                .select('quantidade')
                .eq('id', diaperId)
                .single();

            if (getFraldaError) {
                console.error('Erro ao buscar fralda:', getFraldaError);
                throw getFraldaError;
            }

            if (fralda.quantidade <= 0) {
                throw new Error('Não há mais fraldas disponíveis deste tamanho.');
            }

            // Atualizar a quantidade
            const { error: updateError } = await supabase
                .from('fraldas')
                .update({ quantidade: fralda.quantidade - 1 })
                .eq('id', diaperId);

            if (updateError) {
                console.error('Erro na atualização:', updateError);
                throw updateError;
            }

            alert('Presença confirmada com sucesso!');
            showStep(3);
        } catch (error) {
            console.error('Erro detalhado:', error);
            console.error('Mensagem do erro:', error.message);
            console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
            alert('Ocorreu um erro ao confirmar sua presença. Por favor, tente novamente.');
        }
    });

    // Controle de estado dos formulários
    let guessCompleted = false;
    let messageCompleted = false;
    const finishSection = document.querySelector('.finish-section');
    const finishButton = document.getElementById('finishButton');

    // Função para verificar se ambos os formulários foram completados
    function checkFormsCompletion() {
        if (guessCompleted && messageCompleted) {
            finishSection.style.display = 'block';
        }
    }

    // Formulário de palpites
    const birthGuessForm = document.getElementById('birthGuessForm');
    const skipGuessButton = document.getElementById('skipGuess');

    birthGuessForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const date = document.getElementById('guessDate').value;
            const time = document.getElementById('guessTime').value;
            const weight = parseFloat(document.getElementById('guessWeight').value);
            const nome = document.getElementById('name').value;

            // Validações
            if (!date || !time || !weight || !nome) {
                throw new Error('Todos os campos são obrigatórios');
            }

            const palpite = {
                nome: nome,
                peso: weight,
                data: date,
                hora: time
            };

            console.log('Dados a serem enviados:', palpite);

            const { data, error } = await supabase
                .from('palpites')
                .insert([palpite]);

            if (error) {
                console.error('Erro completo:', JSON.stringify(error, null, 2));
                throw error;
            }

            console.log('Resposta do Supabase:', data);

            birthGuessForm.style.opacity = '0.5';
            birthGuessForm.style.pointerEvents = 'none';
            guessCompleted = true;
            checkFormsCompletion();

            // Rolar suavemente até o próximo formulário
            const messageForm = document.getElementById('messageForm');
            messageForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Focar no primeiro campo do formulário de mensagem
            const messageInput = document.getElementById('message');
            setTimeout(() => {
                messageInput.focus();
            }, 800); // Espera a rolagem terminar antes de focar
        } catch (error) {
            console.error('Erro ao enviar palpite:', error);
            if (error.message) {
                alert(error.message);
            } else {
                alert('Ocorreu um erro ao enviar seu palpite. Por favor, tente novamente.');
            }
        }
    });

    skipGuessButton.addEventListener('click', function() {
        birthGuessForm.style.opacity = '0.5';
        birthGuessForm.style.pointerEvents = 'none';
        guessCompleted = true;
        checkFormsCompletion();
    });

    // Formulário de mensagem
    const messageForm = document.getElementById('messageForm');
    const skipMessageButton = document.getElementById('skipMessage');

    messageForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const nome = document.getElementById('name').value;
            const mensagem = document.getElementById('messageContent').value;

            if (!nome || !mensagem) {
                throw new Error('Nome e mensagem são obrigatórios');
            }

            const { data, error } = await supabase
                .from('mensagens')
                .insert([{ 
                    nome: nome,
                    mensagem: mensagem
                }]);

            if (error) {
                console.error('Erro completo:', JSON.stringify(error, null, 2));
                throw error;
            }

            messageForm.style.opacity = '0.5';
            messageForm.style.pointerEvents = 'none';
            messageCompleted = true;
            checkFormsCompletion();
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            if (error.message) {
                alert(error.message);
            } else {
                alert('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
            }
        }
    });

    skipMessageButton.addEventListener('click', function() {
        messageForm.style.opacity = '0.5';
        messageForm.style.pointerEvents = 'none';
        messageCompleted = true;
        checkFormsCompletion();
    });

    // Botão de finalizar
    finishButton.addEventListener('click', function() {
        showStep(4);
    });

    // Carregar e gerenciar fraldas
    let selectedDiaper = null;
    
    async function loadDiapers() {
        try {
            const { data: fraldas, error } = await supabase
                .from('fraldas')
                .select('*')
                .order('tamanho');

            if (error) throw error;

            const diapersList = document.getElementById('diapersList');
            diapersList.innerHTML = fraldas.map(fralda => `
                <div class="diaper-option ${fralda.quantidade === 0 ? 'disabled' : ''}" 
                     data-id="${fralda.id}" 
                     data-size="${fralda.tamanho}">
                    <p>Fralda ${fralda.tamanho}</p>
                    <div class="diaper-quantity">Restam ${fralda.quantidade} unidades</div>
                </div>
            `).join('');

            // Adicionar eventos de clique
            document.querySelectorAll('.diaper-option').forEach(option => {
                if (option.classList.contains('disabled')) return;
                
                option.addEventListener('click', function() {
                    document.querySelectorAll('.diaper-option').forEach(opt => 
                        opt.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedDiaper = {
                        id: this.dataset.id,
                        size: this.dataset.size
                    };
                });
            });
        } catch (error) {
            console.error('Erro ao carregar fraldas:', error);
        }
    }

    // Carregar fraldas quando a seção de presentes ficar visível
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadDiapers();
                observer.disconnect();
            }
        });
    });
    
    const giftSection = document.querySelector('.gift-section');
    if (giftSection) {
        observer.observe(giftSection);
    }

    function enviarWhatsApp() {
        let telefone = "5549999165914"; // Altere para o número desejado
        let mensagem = "Olá, confirmação realizada com sucesso!";
        let link = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
        window.open(link, '_blank');
    }


    // Controle de música
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const musicIcon = musicToggle.querySelector('.material-icons');
    let isPlaying = false;

    // Tentar iniciar a música automaticamente
    try {
        bgMusic.play().then(() => {
            isPlaying = true;
            musicToggle.classList.add('playing');
            musicIcon.textContent = 'music_note';
        }).catch(() => {
            // Se o autoplay for bloqueado, não faz nada
            console.log('Autoplay bloqueado pelo navegador');
        });
    } catch (e) {
        console.log('Erro ao tentar reproduzir música:', e);
    }

    // Alternar música ao clicar no botão
    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
            musicIcon.textContent = 'music_off';
        } else {
            bgMusic.play();
            musicToggle.classList.add('playing');
            musicIcon.textContent = 'music_note';
        }
        isPlaying = !isPlaying;
    });
});
