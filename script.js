document.addEventListener('DOMContentLoaded', function() {
    // Inicializar contagem regressiva com efeito neon
    const eventDate = new Date('2025-03-15T15:00:00');
    
    function updateCountdown() {
        const now = new Date();
        const diff = eventDate - now;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Adiciona animação de pulso ao mudar os números
        ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
            const element = document.getElementById(id);
            const currentValue = element.textContent;
            const newValue = String(eval(id)).padStart(2, '0');
            
            if (currentValue !== newValue) {
                element.style.animation = 'none';
                element.offsetHeight; // Trigger reflow
                element.style.animation = 'pulse 0.5s';
            }
            element.textContent = newValue;
        });
    }
    
    setInterval(updateCountdown, 1000);
    updateCountdown();
    
    // Máscara para telefone com efeito visual
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = '(' + value;
            if (value.length > 3) {
                value = value.slice(0, 3) + ') ' + value.slice(3);
                if (value.length > 10) {
                    value = value.slice(0, 10) + '-' + value.slice(10, 14);
                }
            }
        }
        e.target.value = value;
        
        // Adiciona efeito de brilho ao digitar
        this.style.animation = 'none';
        this.offsetHeight;
        this.style.animation = 'glow 0.5s';
    });
    
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
                        <h3> Parabéns!</h3>
                        <p>Você encontrou a Helena! </p>
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
                        <p>Essa não é a Helena. Tente novamente! </p>
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
        const phone = document.getElementById('phone').value;
        const hasCompanion = document.getElementById('hasCompanion').checked;
        
        // Validação dos campos de acompanhantes
        if (hasCompanion) {
            const qtdeAcompanhantes = guestsSelect.value;
            if (!qtdeAcompanhantes) {
                alert('Por favor, selecione o número de acompanhantes');
                return;
            }
        }

        const qtdeAcompanhantes = hasCompanion ? parseInt(guestsSelect.value) || 0 : 0;
        const nomesAcompanhantes = hasCompanion ? companionNames.value : '';

        try {
            const { data, error } = await supabase
                .from('confirmacoes')
                .insert([
                    { 
                        nome: name, 
                        telefone: phone,
                        qtde_pessoas: qtdeAcompanhantes,
                        nomes_acompanhantes: nomesAcompanhantes
                    }
                ]);

            if (error) throw error;

            alert('Presença confirmada com sucesso!');
            showStep(3);
        } catch (error) {
            console.error('Erro ao confirmar presença:', error);
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

            // Validações
            if (!date || !time || !weight) {
                throw new Error('Todos os campos são obrigatórios');
            }

            // Formata a data e hora para o padrão ISO
            const dateObj = new Date(date);
            console.log('Data formatada:', dateObj);

            const palpite = {
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
});
