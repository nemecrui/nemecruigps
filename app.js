// ===============================
//  CONFIGURAÇÃO SUPABASE
// ===============================

// ⚠️ Substituir pelos teus valores do Supabase
const SUPABASE_URL = "https://ywufoxqirjneltvqgyqy.supabase.co";
const SUPABASE_KEY = "sb_publishable_3Ki-NcvwZpvBczga9nhjJg_qmjBEXwC";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===============================
//  MAPA LEAFLET
// ===============================
let map = L.map('map').setView([41.55, -8.42], 13);

L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        maxZoom: 19,
        attribution: 'Tiles © Esri'
    }
).addTo(map);


let marker = null;

map.on('click', function (e) {
    definirCoordenadas(e.latlng.lat, e.latlng.lng);
});

function definirCoordenadas(lat, lng) {
    document.getElementById("lat").value = lat;
    document.getElementById("lng").value = lng;

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);

    map.setView([lat, lng], 17);
}

// ===============================
//  GPS AUTOMÁTICO
// ===============================
function usarGPS() {
    if (!navigator.geolocation) {
        alert("GPS não suportado.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => definirCoordenadas(pos.coords.latitude, pos.coords.longitude),
        err => alert("Erro ao obter localização: " + err.message),
        { enableHighAccuracy: true }
    );
}

// ===============================
//  UPLOAD DE FOTOS PARA SUPABASE
// ===============================
async function uploadFotoSupabase(file, nome) {
    if (!file) return null;

    const filePath = `${Date.now()}_${nome}_${file.name}`;

    const { error } = await client.storage
        .from("fotos_gps")
        .upload(filePath, file);

    if (error) {
        console.error("Erro upload:", error);
        return null;
    }

    const { data: publicUrl } = client.storage
        .from("fotos_gps")
        .getPublicUrl(filePath);

    return publicUrl.publicUrl;
}

// ===============================
//  GUARDAR DADOS NO SUPABASE
// ===============================
async function guardar() {

    const equipamento = document.getElementById("equipamento").value.trim();
    const marca = document.getElementById("marca").value.trim();
    const lat = document.getElementById("lat").value;
    const lng = document.getElementById("lng").value;

    if (!equipamento || !lat || !lng) {
        alert("Preencha os campos obrigatórios.");
        return;
    }

    const foto1 = document.getElementById("foto1").files[0] || null;
    const foto2 = document.getElementById("foto2").files[0] || null;
    const foto3 = document.getElementById("foto3").files[0] || null;

    // Upload das fotos
    const url1 = await uploadFotoSupabase(foto1, "foto1");
    const url2 = await uploadFotoSupabase(foto2, "foto2");
    const url3 = await uploadFotoSupabase(foto3, "foto3");

    // Inserir na BD
    const { error } = await client
        .from("equipamentos_gps")
        .insert({
            equipamento,
            marca,
            latitude: lat,
            longitude: lng,
            data_registo: new Date().toISOString(),
            foto1: url1,
            foto2: url2,
            foto3: url3
        });

    if (error) {
        console.error("Erro Supabase:", error);
        alert("Erro ao guardar: " + error.message);
        return;
    }

    alert("Equipamento registado com sucesso!");

    // Reset do formulário
    document.getElementById("equipamento").value = "";
    document.getElementById("marca").value = "";
    document.getElementById("lat").value = "";
    document.getElementById("lng").value = "";
    document.getElementById("foto1").value = "";
    document.getElementById("foto2").value = "";
    document.getElementById("foto3").value = "";

    if (marker) map.removeLayer(marker);
    marker = null;
}
