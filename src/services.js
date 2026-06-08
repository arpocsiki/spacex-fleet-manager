export function calculateLaunchCost(stages, engines) 
{
    let basicFee = 5000000;
    let engineCost = engines * 50000;

    if (stages > 2) {
        basicFee = basicFee * 1.10;
    }
    return basicFee + engineCost;
}