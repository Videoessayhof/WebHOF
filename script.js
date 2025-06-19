// Sample data - you'll want to convert your HTML table data to JSON
const gameData = [
    {
        year: "2025",
        rank: "1st",
        title: "Justin RPG - The Man Who Married a Pokémon & Got Eaten Alive",
        url: "https://www.youtube.com/watch?v=f0grMPcL-FE",
        channel: "Dylan the Knight Owl",
        channelUrl: "https://www.youtube.com/channel/UCi7d277kIezCurlHHd2KJuw",
        tags: ["Pokemon", "marriage", "JustinRPG", "gaming", "creativity"],
        runTime: "01:35:19",
        uploadDate: "2025-06-08",
        summary: "The video explores the bizarre story of Justin RPG...",
        format: "Documentary"
    },
    // Add all your data here
];

document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('#gamesTable tbody');
    
    // Populate table
    function populateTable(data) {
        tableBody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.year}</td>
                <td>${item.rank}</td>
                <td><a href="${item.url}" target="_blank">${item.title}</a></td>
                <td><a href="${item.channelUrl}" target="_blank">${item.channel}</a></td>
                <td>${item.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')}</td>
                <td>${item.runTime}</td>
                <td>${item.uploadDate}</td>
                <td>${item.summary}</td>
                <td>${item.format}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Initial population
    populateTable(gameData);
    
    // Set up TableFilter
    const tf = new TableFilter('gamesTable', {
        base_path: 'https://cdn.jsdelivr.net/npm/tablefilter@2.5.0/dist/tablefilter/',
        col_0: 'select',
        col_1: 'select',
        col_8: 'select',
        alternate_rows: true,
        rows_counter: true,
        btn_reset: true,
        status_bar: true,
        msg_filter: 'Filtering...'
    });
    tf.init();
    
    // Add event listeners for custom filters
    document.getElementById('yearFilter').addEventListener('change', function() {
        const selectedYears = Array.from(this.selectedOptions).map(opt => opt.value);
        if (selectedYears.length > 0) {
            tf.setFilterValue(0, selectedYears.join('|'));
        } else {
            tf.clearFilters();
        }
        tf.filter();
    });
});