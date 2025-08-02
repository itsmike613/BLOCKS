let seeds = [];

fetch('./Source/Data/seeds.json')
    .then(response => response.json())
    .then(data => {
        seeds = data;
        displaySeeds(seeds);
    })
    .catch(error => console.error('Error loading data.json:', error));

function displaySeeds(seedsToDisplay) {
    const seedsContainer = document.getElementById('seeds');
    seedsContainer.innerHTML = '';
    seedsToDisplay.forEach(seed => {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-sm-6';
        card.innerHTML = `
            <div class="card">
                <div class="h-25 overflow-hidden">
                    <img src="${seed.image[0]}" class="card-img-top object-fit-cover bg-no-repeat w-100">
                </div>
                <div class="p-3 d-flex align-items-center justify-content-between gap-6 border-0 py-2">
                    <div class="d-flex align-items-center gap-3 my-1">
                        <img class="avatar object-fit-cover" src="${seed.image[0]}">
                        <div>
                            <span class="d-block text-heading text-sm fw-semibold">${seed.name}</span>
                            <span class="d-sm-block text-muted text-xs">${seed.world.edition} • ${seed.world.version}</span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-dark view-seed" data-seed-name="${seed.name}">View</button>
                </div>
            </div>
        `;
        seedsContainer.appendChild(card);
    });

    document.querySelectorAll('.view-seed').forEach(button => {
        button.addEventListener('click', () => {
            const seedName = button.getAttribute('data-seed-name');
            const selectedSeed = seeds.find(seed => seed.name === seedName);
            displaySeedDetails(selectedSeed);
            const detailsTab = new bootstrap.Tab(document.getElementById('details-tab'));
            detailsTab.show();
        });
    });
}

const searchInput = document.querySelector('#database input[type="text"]');
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredSeeds = seeds.filter(seed => seed.name.toLowerCase().includes(searchTerm));
    displaySeeds(filteredSeeds);
});

const editionCheckboxes = document.querySelectorAll('#filters input[id="java"], #filters input[id="pocket"]');
const versionCheckboxes = document.querySelectorAll('#filters input[id="1.22"], #filters input[id="1.21"]');

function applyFilters() {
    const selectedEditions = Array.from(editionCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.id);
    const selectedVersions = Array.from(versionCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.id);

    let filteredSeeds = seeds;

    if (selectedEditions.length > 0) {
        filteredSeeds = filteredSeeds.filter(seed =>
            selectedEditions.includes(seed.world.edition.toLowerCase())
        );
    }

    if (selectedVersions.length > 0) {
        filteredSeeds = filteredSeeds.filter(seed =>
            selectedVersions.includes(seed.world.version)
        );
    }

    displaySeeds(filteredSeeds);
}

editionCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));
versionCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));

function displaySeedDetails(seed) {
    const detailsContent = document.querySelector('#details > div.d-none');
    const noSeedMessage = document.querySelector('#details > div:last-child');
    detailsContent.classList.remove('d-none');
    noSeedMessage.classList.add('d-none');

    document.querySelector('#details .seed-name').textContent = seed.name;
    document.querySelector('#details .seed-edition-version').textContent = `${seed.world.edition} • ${seed.world.version}`;
    document.querySelector('#details .seed-image').src = seed.image[0];
    document.querySelector('#gameCollapse .edition-input').value = seed.world.edition;
    document.querySelector('#gameCollapse .version-input').value = seed.world.version;
    document.querySelector('#gameCollapse .seed-input').value = seed.world.seed;
    document.querySelector('#spawnCollapse .spawn-biome-input').value = seed.spawn.biome;
    document.querySelector('#surroundingsCollapse .surrounding-biomes-input').value = seed.surro.biomes.join(', ');
    document.querySelector('#surroundingsCollapse .surrounding-structures-input').value = seed.surro.structures.join(', ');
    document.querySelector('#surroundingsCollapse .hidden-structures-input').value = seed.surro.hidden.join(', ');

    const carouselInner = document.querySelector('#galleryCarousel .carousel-inner');
    carouselInner.innerHTML = '';
    seed.image.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        item.innerHTML = `<img src="${image}" class="d-block w-100 rounded" style="max-height: 300px; object-fit: cover;">`;
        carouselInner.appendChild(item);
    });

    document.querySelectorAll('#gameCollapse .btn-icon').forEach(button => {
        button.removeEventListener('click', copyHandler);
        button.addEventListener('click', copyHandler);
    });
}

function copyHandler(event) {
    const input = event.currentTarget.previousElementSibling;
    navigator.clipboard.writeText(input.value).then(() => {
        console.log('Copied to clipboard:', input.value);
    });
}

document.getElementById('go-to-database').addEventListener('click', () => {
    const detailsContent = document.querySelector('#details > div.d-none');
    const noSeedMessage = document.querySelector('#details > div:last-child');
    detailsContent.classList.add('d-none');
    noSeedMessage.classList.remove('d-none');
    const databaseTab = new bootstrap.Tab(document.getElementById('database-tab'));
    databaseTab.show();
});