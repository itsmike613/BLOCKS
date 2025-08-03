let seeds = [];

fetch('./Source/Data/seeds.json')
	.then(res => res.json())
	.then(data => {
		seeds = data;
		displaySeeds(seeds);
		initFilters();
	})
	.catch(err => {
		console.error('Error:', err);
		document.getElementById('seeds').innerHTML = '<p>Error loading seeds.</p>';
	});

function displaySeeds(seedsToDisplay) {
	const container = document.getElementById('seeds');
	container.innerHTML = '';
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
		container.appendChild(card);
	});

	document.querySelectorAll('.view-seed').forEach(btn => {
		btn.removeEventListener('click', handleViewSeed);
		btn.addEventListener('click', handleViewSeed);
	});
}

function handleViewSeed(e) {
	const seedName = e.currentTarget.getAttribute('data-seed-name');
	const seed = seeds.find(s => s.name === seedName);
	displaySeedDetails(seed);
	new bootstrap.Tab(document.getElementById('details-tab')).show();
}

const searchInput = document.querySelector('#database input[type="text"]');
searchInput.addEventListener('input', applyFilters);

const filterConfig = {
	edition: {
		title: "Edition",
		options: [{ id: "java", label: "Java" }, { id: "pocket", label: "Pocket" }]
	},
	version: {
		title: "Version",
		options: [{ id: "1.21", label: "1.21" }, { id: "1.20", label: "1.20" }, { id: "1.22", label: "1.22" }]
	}
};

function generateFilterUI() {
	const container = document.getElementById('filters');
	container.innerHTML = '';
	Object.keys(filterConfig).forEach(cat => {
		const div = document.createElement('div');
		div.innerHTML = `<h6>${filterConfig[cat].title}</h6>`;
		filterConfig[cat].options.forEach(({ id, label }) => {
		div.innerHTML += `
			<div class="form-check">
				<input class="form-check-input" type="checkbox" id="${id}">
				<label class="form-check-label" for="${id}">${label}</label>
			</div>
		`;
		});
		div.innerHTML += '<hr>';
		container.appendChild(div);
	});
}

function applyFilters() {
	let filtered = seeds;
	const search = searchInput.value.toLowerCase();
	if (search) filtered = filtered.filter(s => s.name.toLowerCase().includes(search));
	Object.keys(filterConfig).forEach(cat => {
			const selected = Array.from(document.querySelectorAll(`#filters input[id^="${cat}"]:checked`)).map(cb => cb.id);
			if (selected.length) {
			filtered = filtered.filter(s => selected.includes(cat === 'edition' ? s.world.edition.toLowerCase() : s.world.version));
		}
	});
	displaySeeds(filtered);
}

function initFilters() {
	generateFilterUI();
	document.querySelectorAll('#filters input').forEach(cb => cb.addEventListener('change', applyFilters));
}

function displaySeedDetails(seed) {
	const details = document.querySelector('#details > div.d-none');
	const noSeed = document.querySelector('#details > div:last-child');
	details.classList.remove('d-none');
	noSeed.classList.add('d-none');

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

	const carousel = document.querySelector('#galleryCarousel .carousel-inner');
	carousel.innerHTML = '';
	seed.image.forEach((img, i) => {
		const item = document.createElement('div');
		item.className = `carousel-item ${i === 0 ? 'active' : ''}`;
		item.innerHTML = `<img src="${img}" class="d-block w-100 rounded" style="max-height: 300px; object-fit: cover;">`;
		carousel.appendChild(item);
	});

	const chunkbaseVer = seed.world.version.replace(/\./g, '_');
	const chunkbaseEd = seed.world.edition.toLowerCase();
	const chunkbaseUrl = `https://www.chunkbase.com/apps/seed-map#seed=${seed.world.seed}&platform=${chunkbaseEd}_${chunkbaseVer}&dimension=overworld&x=0&z=0&zoom=0`;

	const mcseedmapEd = seed.world.edition === 'Pocket' ? 'Bedrock' : seed.world.edition;
	const mcseedmapUrl = `https://mcseedmap.net/${seed.world.version}-${mcseedmapEd}/${seed.world.seed}#x=0&z=0&l=0`;

	document.querySelector('#appsCollapse .card-body').innerHTML = `
		<div class="d-flex gap-2">
		<a href="${chunkbaseUrl}" target="_blank" class="btn btn-sm btn-primary">Open in Chunkbase</a>
		<a href="${mcseedmapUrl}" target="_blank" class="btn btn-sm btn-primary">Open in mcseedmap.net</a>
		</div>
	`;

	document.querySelectorAll('#gameCollapse .btn-icon').forEach(btn => {
		btn.removeEventListener('click', copyHandler);
		btn.addEventListener('click', copyHandler);
	});
}

function copyHandler(e) {
	const input = e.currentTarget.previousElementSibling;
	navigator.clipboard.writeText(input.value).then(() => console.log('Copied:', input.value));
}

document.getElementById('go-to-database').addEventListener('click', () => {
	const details = document.querySelector('#details > div.d-none');
	const noSeed = document.querySelector('#details > div:last-child');
	details.classList.add('d-none');
	noSeed.classList.remove('d-none');
	new bootstrap.Tab(document.getElementById('database-tab')).show();
});