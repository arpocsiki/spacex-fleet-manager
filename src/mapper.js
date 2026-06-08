import { calculateLaunchCost } from './services.js';

export function mapRocket(rawRocket) {
    return {
        id: rawRocket.id,
        name: rawRocket.name, 
        active: rawRocket.active,
        stages: rawRocket.stages,
        engines: rawRocket.engines.number,
        leoPayload: rawRocket.payload_weights.find(payload => payload.id === 'leo').kg, 
        height: rawRocket.height.meters,
        diameter: rawRocket.diameter.meters,
        mass: rawRocket.mass.kg,
        image: rawRocket.flickr_images[0], 
        launchCost: calculateLaunchCost(rawRocket.stages, rawRocket.engines.number)
    };
}