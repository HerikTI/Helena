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
    
    function showStep(stepNumber) {
        const currentStepElement = document.getElementById(`step${currentStep}`);
        const nextStepElement = document.getElementById(`step${stepNumber}`);
        
        currentStepElement.classList.add('animate__fadeOutLeft');
        
        setTimeout(() => {
            currentStepElement.classList.remove('active', 'animate__fadeOutLeft');
            nextStepElement.classList.add('active', 'animate__fadeInRight');
            
            setTimeout(() => {
                nextStepElement.classList.remove('animate__fadeInRight');
            }, 1000);
            
            currentStep = stepNumber;
        }, 500);
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
                        <h3>🎉 Parabéns!</h3>
                        <p>Você encontrou a Helena! ❤️</p>
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
                        <p>Essa não é a Helena. Tente novamente! 🔍</p>
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

    // Formulário de palpites
    const birthGuessForm = document.getElementById('birthGuessForm');
    birthGuessForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const weight = document.getElementById('guessWeight').value;
        const date = document.getElementById('guessDate').value;
        const time = document.getElementById('guessTime').value;

        try {
            const { data, error } = await supabase
                .from('palpites')
                .insert([
                    { 
                        peso: weight,
                        data: date,
                        hora: time
                    }
                ]);

            if (error) throw error;

            alert('Palpite registrado com sucesso!');
            
            // Adiciona palpite com animação
            const guessList = document.getElementById('guessList');
            const guessCard = document.createElement('div');
            guessCard.className = 'message-card animate__animated animate__fadeInUp';
            guessCard.innerHTML = `
                <h4>✨ Palpite de ${document.getElementById('name').value}</h4>
                <p>🗓️ Data: ${new Date(date + 'T' + time).toLocaleString()}</p>
                <p>⚖️ Peso: ${weight}kg</p>
            `;
            guessList.insertBefore(guessCard, guessList.firstChild);
            
            this.reset();
            this.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => this.classList.remove('animate__animated', 'animate__pulse'), 1000);
        } catch (error) {
            console.error('Erro ao registrar palpite:', error);
            alert('Ocorreu um erro ao registrar seu palpite. Por favor, tente novamente.');
        }
    });

    // Formulário de mensagens
    const messageForm = document.getElementById('messageForm');
    messageForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = document.getElementById('messageContent').value;
        const name = document.getElementById('name').value;

        try {
            const { data, error } = await supabase
                .from('mensagens')
                .insert([
                    { 
                        nome: name,
                        mensagem: message
                    }
                ]);

            if (error) throw error;

            alert('Mensagem enviada com sucesso!');
            
            // Adiciona mensagem com animação
            const messageWall = document.getElementById('messageWall');
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card animate__animated animate__fadeInUp';
            messageCard.innerHTML = `
                <h4>✨ Mensagem de ${name}</h4>
                <p>${message}</p>
            `;
            messageWall.insertBefore(messageCard, messageWall.firstChild);
            
            this.reset();
            this.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => this.classList.remove('animate__animated', 'animate__pulse'), 1000);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            alert('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
        }
    });
});
