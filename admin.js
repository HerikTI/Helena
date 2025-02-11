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
        await loadDiaperReservations();
    }

    async function loadStats() {
        try {
            const { data, error } = await supabase
                .from('confirmacoes')
                .select('qtde_pessoas');

            if (error) throw error;

            const totalConfirmacoes = data.length;
            const totalPessoas = data.reduce((sum, row) => sum + (row.qtde_pessoas || 0), 0) + totalConfirmacoes;

            document.getElementById('totalConfirmacoes').textContent = totalConfirmacoes;
            document.getElementById('totalPessoas').textContent = totalPessoas;

            // Carregar estatísticas das fraldas
            const { data: fraldas, error: fraldasError } = await supabase
                .from('fraldas')
                .select('*')
                .order('tamanho');

            if (fraldasError) throw fraldasError;

            const diaperStats = document.getElementById('diaperStats');
            if (diaperStats) {
                diaperStats.innerHTML = `
                    <h3>Fraldas Disponíveis</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Tamanho</th>
                                <th>Quantidade Restante</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fraldas.map(fralda => `
                                <tr>
                                    <td>Tamanho ${fralda.tamanho}</td>
                                    <td>${fralda.quantidade} unidades</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
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
                    <td>${row.nome}</td>
                    <td>${row.data}</td>
                    <td>${row.hora}</td>
                    <td>${row.peso}kg</td>
                    <td>${new Date(row.created_at).toLocaleString()}</td>
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

    async function loadDiaperReservations() {
        try {
            const { data, error } = await supabase
                .from('reservas_fraldas')
                .select(`
                    *,
                    fraldas (tamanho)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const tbody = document.querySelector('#diaperReservationsList tbody');
            tbody.innerHTML = data.map(row => `
                <tr>
                    <td>${row.nome}</td>
                    <td>Tamanho ${row.fraldas.tamanho}</td>
                    <td>${row.quantidade}</td>
                    <td>${new Date(row.created_at).toLocaleString()}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Erro ao carregar reservas de fraldas:', error);
        }
    }
});
