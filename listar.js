// ===============================
//  CONFIGURAÇÃO SUPABASE
// ===============================

const SUPABASE_URL = "https://ywufoxqirjneltvqgyqy.supabase.co";
const SUPABASE_KEY = "sb_publishable_3Ki-NcvwZpvBczga9nhjJg_qmjBEXwC";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===============================
//  MAPA LEAFLET
// ===============================

let map = L.map('map').setView([41.55, -8.42], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// ===============================
//  CARREGAR EQUIPAMENTOS
// ===============================

async function carregarEquipamentos() {

    const { data, error } = await client
        .from("equipamentos_gps")
        .select("*");

    if (error) {
        console.error("Erro ao carregar:", error);
        alert("Erro ao carregar equipamentos.");
        return;
    }

    data.forEach(item => {

        if (!item.latitude || !item.longitude) return;

        const marker = L.marker([item.latitude, item.longitude]).addTo(map);

        let popup = `
            <div style="font-size:15px; font-weight:600; margin-bottom:6px;">
                ${item.equipamento}
            </div>
        
            <div style="font-size:13px; color:#444;">
                Marca: <b>${item.marca || "—"}</b><br>
                Registado em: <small>${item.data_registo}</small>
            </div>
        
            <hr style="margin:10px 0;">
        
            <a href="https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}"
               target="_blank"
               style="color:#d40000; font-weight:bold;">
               ➜ Navegar até aqui
            </a>
            
            <a href="https://waze.com/ul?ll=${item.latitude},${item.longitude}&navigate=yes" 
               target="_blank" 
               style="color:green; font-weight:bold;">
               🚗 Navegar com Waze
            </a><br><br>
        
            <a href="http://maps.apple.com/?daddr=${item.latitude},${item.longitude}" 
               target="_blank" 
               style="color:black; font-weight:bold;">
               🍎 Navegar com Apple Maps
        
            <br><br>
        `;
        
        if (item.foto1) popup += `<img src="${item.foto1}" width="120"><br>`;
        if (item.foto2) popup += `<img src="${item.foto2}" width="120"><br>`;
        if (item.foto3) popup += `<img src="${item.foto3}" width="120"><br>`;

        marker.bindPopup(popup);
    });
}

carregarEquipamentos();
