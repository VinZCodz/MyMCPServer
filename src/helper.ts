const OW_API_BASE = "https://api.openweathermap.org";
const OW_API_KEY = process.env.OW_API_KEY;

export async function makeOWRequest<T>(city: string): Promise<T | null> {
    const url = `${OW_API_BASE}/data/2.5/weather?q=${city}&appid=${OW_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as T;
    } catch (error) {
        console.error("Error making Open Weather request:", error);
        return null;
    }
}