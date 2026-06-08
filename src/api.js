export async function getRockets()
{

    
    const url = "https://api.spacexdata.com/v4/rockets";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    
    }
