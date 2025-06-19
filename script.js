// Configuration
const ROWS_PER_PAGE = 20;
let currentPage = 1;
let filteredData = [];
let gameData = [];

// DOM Elements
const tableBody = document.querySelector('#gamesTable tbody');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const itemCount = document.getElementById('itemCount');
const totalVideosEl = document.getElementById('totalVideos');
const totalRuntimeEl = document.getElementById('totalRuntime');
const yearFilter = document.getElementById('yearFilter');
const formatFilter = document.getElementById('formatFilter');
const searchInput = document.getElementById('searchInput');
const resetFiltersBtn = document.getElementById('resetFilters');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
});

// Load data from JSON file
async function loadData() {
    try {
        showLoading();
        const response = await fetch('data.json');
        gameData = await response.json();
        
        // Calculate and display totals
        totalVideosEl.textContent = gameData.length;
        calculateTotalRuntime();
        
        // Initialize filters
        initializeFilters();
        
        // Initial table population
        filteredData = [...gameData];
        updateTable();
        updatePagination();
        
        // Initialize TableFilter
        initializeTableFilter();
        
    } catch (error) {
        console.error('Error loading data:', error);
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading data. Please try again later.</td></tr>';
    }
}

// Calculate total runtime
function calculateTotalRuntime() {
    const totalSeconds = gameData.reduce((total, item) => {
        const [hours, minutes, seconds] = item.runTime.split(':').map(Number);
        return total + (hours * 3600) + (minutes * 60) + seconds;
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    totalRuntimeEl.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Initialize filter dropdowns
function initializeFilters() {
    // Years
    const years = [...new Set(gameData.map(item => item.year))].sort((a, b) => b - a);
    yearFilter.innerHTML = '<option value="">All Years</option>' + 
        years.map(year => `<option value="${year}">${year}</option>`).join('');
    
    // Formats
    const formats = [...new Set(gameData.map(item => item.format))].sort();
    formatFilter.innerHTML = '<option value="">All Formats</option>' + 
        formats.map(format => `<option value="${format}">${format}</option>`).join('');
}

// Initialize TableFilter
function initializeTableFilter() {
    const tf = new TableFilter('gamesTable', {
        base_path: 'https://cdn.jsdelivr.net/npm/tablefilter@2.5.0/dist/tablefilter/',
        col_0: 'select',
        col_1: 'select',
        col_7: 'select',
        alternate_rows: true,
        rows_counter: true,
        btn_reset: true,
        status_bar: true,
        msg_filter: 'Filtering...',
        paging: {
            results_per_page: ROWS_PER_PAGE,
            css: {
                page_btn: 'btn btn-sm btn-outline-secondary',
                page_btn_active: 'active',
                page_btn_disabled: 'disabled'
            }
        }
    });
    tf.init();
}

// Update table with current data
function updateTable() {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    const pageData = filteredData.slice(start, end);
    
    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No matching videos found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = pageData.map(item => `
        <tr>
            <td data-label="Year">${item.year}</td>
            <td data-label="Rank">${item.rank}</td>
            <td data-label="Title"><a href="${item.url}" target="_blank">${item.title}</a></td>
            <td data-label="Channel"><a href="${item.channelUrl}" target="_blank">${item.channel}</a></td>
            <td data-label="Tags">${item.tags.map(tag => `<span class="badge bg-secondary">${tag}</span>`).join('')}</td>
            <td data-label="Runtime">${item.runTime}</td>
            <td data-label="Uploaded">${item.uploadDate}</td>
            <td data-label="Format">${item.format}</td>
        </tr>
    `).join('');
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    itemCount.textContent = `${filteredData.length} items`;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Show loading state
function showLoading() {
    tableBody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
                <div class="loading"></div> Loading data...
            </td>
        </tr>
    `;
}

// Event listeners
function setupEventListeners() {
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateTable();
            updatePagination();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            updateTable();
            updatePagination();
        }
    });
    
    // Filters
    yearFilter.addEventListener('change', applyFilters);
    formatFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    
    // Reset filters
    resetFiltersBtn.addEventListener('click', () => {
        yearFilter.value = '';
        formatFilter.value = '';
        searchInput.value = '';
        applyFilters();
    });
}

// Apply all filters
function applyFilters() {
    currentPage = 1;
    
    const selectedYears = Array.from(yearFilter.selectedOptions).map(opt => opt.value);
    const selectedFormats = Array.from(formatFilter.selectedOptions).map(opt => opt.value);
    const searchTerm = searchInput.value.toLowerCase();
    
    filteredData = gameData.filter(item => {
        // Year filter
        if (selectedYears.length > 0 && !selectedYears.includes('') && !selectedYears.includes(item.year)) {
            return false;
        }
        
        // Format filter
        if (selectedFormats.length > 0 && !selectedFormats.includes('') && !selectedFormats.includes(item.format)) {
            return false;
        }
        
        // Search filter
        if (searchTerm && 
            !item.title.toLowerCase().includes(searchTerm) && 
            !item.channel.toLowerCase().includes(searchTerm) &&
            !item.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
            return false;
        }
        
        return true;
    });
    
    updateTable();
    updatePagination();
}
