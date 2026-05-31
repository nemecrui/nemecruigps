// ===============================
//  CONFIGURAÇÃO SUPABASE
// ===============================

const SUPABASE_URL = "https://ywufoxqirjneltvqgyqy.supabase.co";
const SUPABASE_KEY = "sb_publishable_3Ki-NcvwZpvBczga9nhjJg_qmjBEXwC";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===============================
//  MAPA LEAFLET
// ===============================

let map = L.map('map', {
    maxZoom: 19
}).setView([41.55, -8.42], 12);

let map3D = null;

function iniciarMapa3D() {
    map3D = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.stadiamaps.com/styles/alidade_satellite.json',
        center: [-8.42, 41.55],
        zoom: 13,
        pitch: 60,
        bearing: -20
    });

let modo3D = false;

document.getElementById("toggle3d").addEventListener("click", () => {

    if (!modo3D) {
        // ATIVAR 3D
        map.remove(); // desliga Leaflet
        iniciarMapa3D();
        document.getElementById("toggle3d").innerText = "2D";
        modo3D = true;
    } else {
        // VOLTAR AO 2D
        map3D.remove(); // desliga MapLibre
        location.reload(); // recarrega Leaflet com clusters
        // (mais limpo que recriar Leaflet manualmente)
    }
});


    map3D.addControl(new maplibregl.NavigationControl());
}



let markersCluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 60,
    spiderfyOnMaxZoom: true,
    animateAddingMarkers: true
});

map.addLayer(markersCluster);

L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
    {
        maxZoom: 19,
        attribution: 'Tiles © Esri'
    }
).addTo(map);


// ===============================
//  CARREGAR EQUIPAMENTOS
// ===============================

function formatarData(dataISO) {
    const d = new Date(dataISO);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}


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
        // CRIAR POPUP PREMIUM
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
        // CRIAR MARCADOR
        // ============================

        const marker = L.marker([item.latitude, item.longitude]);

        // adicionar ao cluster
        markersCluster.addLayer(marker);

        // animação bounce
        setTimeout(() => {
            if (marker._icon) {
                marker._icon.classList.add("marker-bounce");
            }
        }, 10);

        // associar popup
        marker.bindPopup(popup);
    });
}

carregarEquipamentos();
