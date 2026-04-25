import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const city = process.env.CITY_NAME || 'Popayan';
    const country = process.env.COUNTRY_CODE || 'CO';

    if (!apiKey || apiKey === 'TU_API_KEY_AQUI') {
        return NextResponse.json({ error: 'API Key no configurada' }, { status: 400 });
    }

    try {
        console.log(`🔍 Consultando clima oficial para: ${city}, ${country}`);
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric&lang=es`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
            console.error('❌ Error de OpenWeather:', data.message);
            throw new Error(data.message);
        }

        // Consultar UV Index (Requiere latitud y longitud)
        let uvData = { value: 0 };
        try {
            const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}`;
            const uvRes = await fetch(uvUrl);
            uvData = await uvRes.json();
        } catch (e) {
            console.error('Error al obtener UV:', e);
        }

        console.log('✅ Datos oficiales recibidos con éxito');
        return NextResponse.json({
            temp: data.main.temp,
            hum: data.main.humidity,
            desc: data.weather[0].description,
            icon: data.weather[0].icon,
            city: data.name,
            rain: data.rain ? (data.rain['1h'] || 0) : 0,
            wind: data.wind.speed,
            uv: uvData.value || 0,
            clouds: data.clouds.all
        });
    } catch (error: any) {
        console.error('❌ Error en API External:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
