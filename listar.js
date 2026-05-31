// ===============================
//  CONFIGURAÇÃO SUPABASE
// ===============================

const SUPABASE_URL = "https://ywufoxqirjneltvqgyqy.supabase.co";
const SUPABASE_KEY = "sb_publishable_3Ki-NcvwZpvBczga9nhjJg_qmjBEXwC";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===============================
//  MAPA LEAFLET (2D)
// ===============================

let map = L.map('map', {
    maxZoom: 19
}).setView([41.55, -8.42], 12);

// CLUSTERS
let markersCluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 60,
    spiderfyOnMaxZoom: true,
    animateAddingMarkers: true
});

map.addLayer(markersCluster);

// ===============================
//  CAMADA SATÉLITE
// ===============================

// CAMADA SATÉLITE
const satelite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19 }
);

// CAMADA NORMAL (OSM)
const normal = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 19 }
);

satelite.addTo(map);

let modoNormal = false;

    document.getElementById("toggle3d").addEventListener("click", () => {
    
        if (!modoNormal) {
            // MUDAR PARA MAPA NORMAL
            map.removeLayer(satelite);
            normal.addTo(map);
            document.getElementById("toggle3d").innerText = "Satélite";
            modoNormal = true;
    
        } else {
            // VOLTAR AO SATÉLITE
            map.removeLayer(normal);
            satelite.addTo(map);
            document.getElementById("toggle3d").innerText = "Normal";
            modoNormal = false;
        }
    });



// ===============================
//  CAMADA LABELS (MODO HÍBRIDO)
// ===============================

const labels = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
    {
        maxZoom: 19,
        opacity: 0.85,
        attribution: '© OpenStreetMap, © Carto'
    }
);

labels.addTo(map);

// ===============================
//  FORMATAR DATA
// ===============================

function formatarData(dataISO) {
    const d = new Date(dataISO);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

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

        // ============================
        // POPUP PREMIUM
        // ============================

        let popup = `
            <div class="popup-card">
                <div class="popup-title">
                    Entidade: ${item.equipamento}
                </div>
            
                <div class="popup-info">
                    Marca: <b>${item.marca || "—"}</b><br>
                    Registado em: <small>${formatarData(item.data_registo)}</small>
                </div>
            
                <hr class="popup-sep">
            
                <a class="popup-btn" 
                    href="https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}"
                   target="_blank"
                   style="color:white; font-weight:bold;">
                   ➜ Navegar até aqui
                </a><br><br>
                
                <a class="popup-btn"
                    href="https://waze.com/ul?ll=${item.latitude},${item.longitude}&navigate=yes" 
                   target="_blank" 
                   style="color:white; font-weight:bold;">
                   🚗 Navegar com Waze
                </a><br><br>
            
                <a class="popup-btn"
                   href="http://maps.apple.com/?daddr=${item.latitude},${item.longitude}" 
                   target="_blank" 
                   style="color:white; font-weight:bold;">
                   🍎 Navegar com Apple Maps
                </a><br><br>
            </div>
        `;
        
        if (item.foto1) popup += `<img src="${item.foto1}" width="120"><br>`;
        if (item.foto2) popup += `<img src="${item.foto2}" width="120"><br>`;
        if (item.foto3) popup += `<img src="${item.foto3}" width="120"><br>`;

        // ============================
        // MARCADOR
        // ============================

        const marker = L.marker([item.latitude, item.longitude]);

        markersCluster.addLayer(marker);

        // animação bounce
        setTimeout(() => {
            if (marker._icon) {
                marker._icon.classList.add("marker-bounce");
            }
        }, 10);

        marker.bindPopup(popup);
    });
}

carregarEquipamentos();
