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
            await loadDiaperStats();
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    async function loadDiaperStats() {
        try {
            // Buscar dados das fraldas
            const { data: diapers, error: diapersError } = await supabase
                .from('fraldas')
                .select('*')
                .order('tamanho');

            if (diapersError) throw diapersError;

            // Buscar dados das reservas
            const { data: reservations, error: reservationsError } = await supabase
                .from('reservas_fraldas')
                .select(`
                    quantidade,
                    fralda_id,
                    fraldas (
                        id,
                        tamanho
                    )
                `);

            if (reservationsError) throw reservationsError;

            // Calcular total reservado por tamanho
            const reservedTotals = {};
            reservations.forEach(reservation => {
                const diaperSize = reservation.fraldas.tamanho;
                reservedTotals[diaperSize] = (reservedTotals[diaperSize] || 0) + reservation.quantidade;
            });

            // Criar tabela com os dados
            const tableBody = document.querySelector('#diapersTable tbody');
            tableBody.innerHTML = '';

            diapers.forEach(diaper => {
                const row = document.createElement('tr');
                const reservedAmount = reservedTotals[diaper.tamanho] || 0;
                
                row.innerHTML = `
                    <td>Fralda ${diaper.tamanho}</td>
                    <td>${diaper.quantidade}</td>
                    <td>${reservedAmount}</td>
                `;
                
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Erro ao carregar estatísticas de fraldas:', error);
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
