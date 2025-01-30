// Senha de admin (você deve alterar para uma senha segura)
const ADMIN_PASSWORD = 'helena2025';

document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('loginSection');
    const adminSection = document.getElementById('adminSection');
    const loginForm = document.getElementById('loginForm');

    // Verifica se já está logado
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showAdminPanel();
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
        } else {
            alert('Senha incorreta!');
        }
    });

    async function showAdminPanel() {
        loginSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        await loadStats();
        await loadConfirmations();
        await loadGuesses();
        await loadMessages();
    }

    async function loadStats() {
        try {
            const { data, error } = await supabase
                .from('confirmacoes')
                .select('qtde_pessoas');

            if (error) throw error;

            const totalConfirmacoes = data.length;
            // Total de pessoas é a soma dos acompanhantes mais o número de confirmações
            const totalPessoas = data.reduce((sum, row) => sum + (row.qtde_pessoas || 0), 0) + totalConfirmacoes;

            document.getElementById('totalConfirmacoes').textContent = totalConfirmacoes;
            document.getElementById('totalPessoas').textContent = totalPessoas;
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    async function loadConfirmations() {
        try {
            const { data, error } = await supabase
                .from('confirmacoes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const tbody = document.querySelector('#confirmationsList tbody');
            tbody.innerHTML = data.map(row => `
                <tr>
                    <td>${row.nome}</td>
                    <td>${row.telefone}</td>
                    <td>${row.qtde_pessoas || 0}</td>
                    <td>${row.nomes_acompanhantes || '-'}</td>
                    <td>${new Date(row.created_at).toLocaleString()}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Erro ao carregar confirmações:', error);
        }
    }

    async function loadGuesses() {
        try {
            const { data, error } = await supabase
                .from('palpites')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const tbody = document.querySelector('#guessesList tbody');
            tbody.innerHTML = data.map(row => `
                <tr>
                    <td>${row.data}</td>
                    <td>${row.hora}</td>
                    <td>${row.peso}kg</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Erro ao carregar palpites:', error);
        }
    }

    async function loadMessages() {
        try {
            const { data, error } = await supabase
                .from('mensagens')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const tbody = document.querySelector('#messagesList tbody');
            tbody.innerHTML = data.map(row => `
                <tr>
                    <td>${row.nome}</td>
                    <td>${row.mensagem}</td>
                    <td>${new Date(row.created_at).toLocaleString()}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        }
    }
});
