import "./style.css";
import { getRockets } from "./api.js";
import { mapRocket } from "./mapper.js";

let rockets = [];
let showOnlyActive = false;
let fleet = [];
let selectedRockets = [];

var init = function () {
  function delay(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  function renderLoader() {
    document.querySelector("#app").innerHTML = `
               
                <p>Kapcsolódás a SpaceX szerveréhez...</p>
            `;
  }
  function renderRockets(rockets) {
    const totalPayload = fleet.reduce(
      (sum, rocket) => sum + rocket.leoPayload,
      0,
    );

    const totalLaunchCost = fleet.reduce(
      (sum, rocket) => sum + rocket.launchCost,
      0,
    );

    const averageLaunchCost =
      fleet.length === 0 ? 0 : Math.round(totalLaunchCost / fleet.length);

    const rocketsToRender = showOnlyActive
      ? rockets.filter((rocket) => rocket.active)
      : rockets;

    var html = `
            <div>
                <h1>SpaceX Rakéta Menedzser</h1>
                <button id="all-rockets">Összes rakéta</button>
                <button id="active-rockets">Aktív rakéták</button>
            </div>
            
           <div class="fleet-bar">
    <h3>Flotta</h3>
    <p>Rakéták száma: ${fleet.length}</p>
<p>LEO teherbírás: ${totalPayload.toLocaleString()} kg</p>
<p>Átlagos kilövési költség: $${averageLaunchCost.toLocaleString()}</p>
</div>
        `;

    if (selectedRockets.length === 2) {
      html += `
        <h3>Rakéta összehasonlítás</h3>

        <button id="clear-comparison">
    Összehasonlítás törlése
</button>

        <table border="1">
            <tr>
                <th>Tulajdonság</th>
                <th>${selectedRockets[0].name}</th>
                <th>${selectedRockets[1].name}</th>
            </tr>

            <tr>
                <td>Magasság</td>
                <td>${selectedRockets[0].height} m</td>
                <td>${selectedRockets[1].height} m</td>
            </tr>

            <tr>
                <td>Átmérő</td>
                <td>${selectedRockets[0].diameter} m</td>
                <td>${selectedRockets[1].diameter} m</td>
            </tr>

            <tr>
                <td>Tömeg</td>
                <td>${selectedRockets[0].mass.toLocaleString()} kg</td>
                <td>${selectedRockets[1].mass.toLocaleString()} kg</td>
            </tr>

            <tr>
                <td>Fokozatok száma</td>
                <td>${selectedRockets[0].stages}</td>
                <td>${selectedRockets[1].stages}</td>
            </tr>

            <tr>
                <td>Hajtóművek száma</td>
                <td>${selectedRockets[0].engines}</td>
                <td>${selectedRockets[1].engines}</td>
            </tr>

            <tr>
                td>LEO teherbírás</td>
                <td>${selectedRockets[0].leoPayload.toLocaleString()} kg</td>
                <td>${selectedRockets[1].leoPayload.toLocaleString()} kg</td>
            </tr>

            <tr>
                <td>Kilövési költség</td>
                <td>$${selectedRockets[0].launchCost.toLocaleString()}</td>
<td>$${selectedRockets[1].launchCost.toLocaleString()}</td>
            </tr>
        </table>
    `;
    }
    html += `
    <p>
        Összehasonlításra kiválasztva:
        ${selectedRockets.map((r) => r.name).join(", ")}
    </p>
`;
    html += `
                <ul>
                    ${fleet
                      .map(
                        (rocket) => `
                        <li>
                            ${rocket.name}
                            <button
                                class="remove-from-fleet"
                                data-id="${rocket.id}">
                                Eltávolítás
                            </button>
                        </li>
                    `,
                      )
                      .join("")}
                </ul>
            `;

    html += rocketsToRender
      .map(
        (rocket) => `
    <div class="rocket-card">
    <img
            src="${rocket.image}"
            alt="${rocket.name}"
            width="300"
        >
        <h2>${rocket.name}</h2>

        <p>Kilövési költség: $${rocket.launchCost.toLocaleString()}</p>

        <button
            class="add-to-fleet"
            data-id="${rocket.id}">
            Hozzáadás a flottához
        </button>

        <button
            class="compare-rocket"
            data-id="${rocket.id}">
            Összehasonlítás
        </button>
    </div>
`,
      )
      .join("");

    document.querySelector("#app").innerHTML = html;
    const allButton = document.querySelector("#all-rockets");
    const activeButton = document.querySelector("#active-rockets");
    const fleetButtons = document.querySelectorAll(".add-to-fleet");
    const compareButtons = document.querySelectorAll(".compare-rocket");
    const removeButtons = document.querySelectorAll(".remove-from-fleet");
    const clearComparisonButton = document.querySelector("#clear-comparison");
    if (clearComparisonButton) {
      clearComparisonButton.addEventListener("click", () => {
        selectedRockets = [];

        renderRockets(rockets);
      });
    }

    fleetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const rocketId = button.getAttribute("data-id");
        const rocket = rockets.find((r) => r.id === rocketId);

        if (rocket) {
          const alreadyInFleet = fleet.find((r) => r.id === rocket.id);

          if (!alreadyInFleet) {
            fleet.push(rocket);
          }

          renderRockets(rockets);
        }
      });
    });
    removeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const rocketId = button.getAttribute("data-id");

        fleet = fleet.filter((rocket) => rocket.id !== rocketId);

        renderRockets(rockets);
      });
    });

    compareButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const rocketId = button.getAttribute("data-id");

        const rocket = rockets.find((r) => r.id === rocketId);

        if (!rocket) return;

        const alreadySelected = selectedRockets.find((r) => r.id === rocket.id);

        if (!alreadySelected && selectedRockets.length < 2) {
          selectedRockets.push(rocket);
        }

        renderRockets(rockets);
      });
    });
    allButton.addEventListener("click", () => {
      showOnlyActive = false;
      renderRockets(rockets);
    });

    activeButton.addEventListener("click", () => {
      showOnlyActive = true;
      renderRockets(rockets);
    });
  }

  renderLoader();
  Promise.all([getRockets(), delay(3000)]).then(([rawRockets]) => {
    rockets = rawRockets.map(mapRocket);
    var sortedRockets = rockets.sort((a, b) => a.launchCost - b.launchCost);
    renderRockets(sortedRockets);
  });
};
init();
