// DOM 元素
const movieTitle = document.getElementById('movieTitle');
const movieLink = document.getElementById('movieLink');
const addLinkBtn = document.getElementById('addLink');
const contentInput = document.getElementById('contentInput');
const formatBtn = document.getElementById('formatBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const searchHistory = document.getElementById('searchHistory');
const historyList = document.getElementById('historyList');
const savedLinks = document.getElementById('savedLinks');

// 本地存储键
const HISTORY_KEY = 'articleHistory';
const LINKS_KEY = 'savedLinks';

// 分页配置
const PAGE_SIZE = 10;
let currentHistoryPage = 1;
let currentLinksPage = 1;

// 获取分页元素
const historyPrevPage = document.getElementById('historyPrevPage');
const historyNextPage = document.getElementById('historyNextPage');
const historyPageInfo = document.getElementById('historyPageInfo');
const linksPrevPage = document.getElementById('linksPrevPage');
const linksNextPage = document.getElementById('linksNextPage');
const linksPageInfo = document.getElementById('linksPageInfo');

// 添加全局变量
let deleteItemCallback = null;
const confirmModal = document.getElementById('confirmModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');

// 在文件开头添加 SheetJS CDN
document.head.innerHTML += '<script src="https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js"></script>';

// 获取新增的DOM元素
const searchLinks = document.getElementById('searchLinks');
const exportLinks = document.getElementById('exportLinks');
const importLinks = document.getElementById('importLinks');
const fileInput = document.getElementById('fileInput');

// 搜索功能
let searchLinksText = '';
searchLinks.addEventListener('input', (e) => {
    searchLinksText = e.target.value;
    currentLinksPage = 1; // 重置到第一页
    loadSavedLinks();
});

// 在页面加载时引入SheetJS
function loadSheetJS() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load SheetJS'));
        document.head.appendChild(script);
    });
}

// SheetJS加载完成
loadSheetJS().then(() => {
    console.log('SheetJS loaded successfully');
}).catch(error => {
    console.error('Error loading SheetJS:', error);
});

// 修改导出功能
exportLinks.addEventListener('click', async () => {
    // 确保XLSX对象存在
    if (typeof XLSX === 'undefined') {
        try {
            await loadSheetJS();
        } catch (error) {
            alert('导出功能加载失败，请刷新页面重试');
            return;
        }
    }

    const links = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
    if (links.length === 0) {
        alert('没有可导出的链接');
        return;
    }

    // 准备Excel数据
    const excelData = links.map(item => ({
        '电影名称': item.title,
        '链接地址': item.link,
        '保存时间': new Date(item.timestamp).toLocaleString()
    }));

    // 创建工作簿和工作表
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // 设置列宽
    const colWidths = [
        { wch: 30 }, // 电影名称
        { wch: 50 }, // 链接地址
        { wch: 20 }  // 保存时间
    ];
    ws['!cols'] = colWidths;

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, "链接列表");

    // 导出文件
    XLSX.writeFile(wb, `影视链接_${new Date().toLocaleDateString()}.xlsx`);
});

// 导入链接
importLinks.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // 获取现有链接
            const existingLinks = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');

            // 处理导入的数据
            const newLinks = jsonData.map(row => ({
                title: row['电影名称'],
                link: row['链接地址'],
                timestamp: new Date().getTime()
            }));

            // 合并链接并去重
            const allLinks = [...existingLinks, ...newLinks];
            const uniqueLinks = allLinks.filter((link, index, self) =>
                index === self.findIndex((t) => t.title === link.title && t.link === link.link)
            );

            // 保存到本地存储
            localStorage.setItem(LINKS_KEY, JSON.stringify(uniqueLinks));
            loadSavedLinks();
            alert('导入成功！');
        } catch (error) {
            console.error('导入失败:', error);
            alert('导入失败，请确保文件格式正确');
        }
    };
    reader.readAsArrayBuffer(file);
    fileInput.value = ''; // 重置文件输入
});

// 初始化
loadHistory();
loadSavedLinks();

// 添加链接
addLinkBtn.addEventListener('click', () => {
    const title = movieTitle.value.trim();
    const link = movieLink.value.trim();
    
    if (!title || !link) {
        alert('请输入电影名称和链接地址');
        return;
    }

    const links = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
    links.unshift({ title, link, timestamp: Date.now() });
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
    
    movieTitle.value = '';
    movieLink.value = '';
    loadSavedLinks();
});

// 格式化内容
formatBtn.addEventListener('click', () => {
    const content = contentInput.value.trim();
    if (!content) {
        alert('请输入需要整理的内容');
        return;
    }

    // 提取电影名称
    const movieNameMatch = content.match(/《([^》]+)》/);
    const movieName = movieNameMatch ? movieNameMatch[1] : '未知电影';
    
    // 查找匹配的链接
    const savedLinks = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
    const matchedLink = savedLinks.find(link => 
        link.title.includes(movieName) || movieName.includes(link.title)
    );
    
    // 构建格式化内容
    const formattedContent = `提示：电影《${movieName}》全集在线观看地址百度云/夸克网盘资源链接放在文章中间👇👇，往下翻就行
提示：电影《${movieName}》全集在线观看地址百度云/夸克网盘资源链接放在文章中间👇👇，往下翻就行

${content}

《${movieName}》（资源尽快保存，随时失效）

链接：${matchedLink ? matchedLink.link : ''}

提示：复制上方网盘链接到浏览器搜索打开即可保存观看
资源完全免费；不会收取您任何费用，资源搜集于互联网公开分享资源，如有侵权，联系立删`;

    // 显示格式化后的内容
    document.getElementById('outputText').textContent = formattedContent;
    
    // 保存到历史记录
    saveToHistory(content, formattedContent, movieName);
});

// 复制内容
copyBtn.addEventListener('click', () => {
    const content = document.getElementById('outputText').textContent;
    if (!content) {
        alert('没有可复制的内容');
        return;
    }

    navigator.clipboard.writeText(content)
        .then(() => alert('内容已复制到剪贴板'))
        .catch(err => console.error('复制失败:', err));
});

// 清空输入
clearBtn.addEventListener('click', () => {
    contentInput.value = '';
    document.getElementById('outputText').textContent = '';
});

// 搜索历史记录
searchHistory.addEventListener('input', (e) => {
    currentHistoryPage = 1; // 搜索时重置到第一页
    loadHistory(e.target.value);
});

// 显示确认弹窗
function showConfirmModal(callback) {
    console.log('显示确认框'); // 调试日志
    deleteItemCallback = callback;
    confirmModal.classList.add('show');
}

// 隐藏确认弹窗
function hideConfirmModal() {
    console.log('隐藏确认框'); // 调试日志
    confirmModal.classList.remove('show');
    deleteItemCallback = null;
}

// 绑确认和取消按钮的件
confirmDelete.addEventListener('click', () => {
    console.log('点击确认按钮'); // 调试日志
    if (deleteItemCallback) {
        deleteItemCallback();
    }
    hideConfirmModal();
});

cancelDelete.addEventListener('click', () => {
    console.log('点击取消按钮'); // 调试日志
    hideConfirmModal();
});

// 加载历史记录
function loadHistory(searchTerm = '') {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const filteredHistory = history.filter(item => {
        return item.movieName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const totalPages = Math.ceil(filteredHistory.length / PAGE_SIZE);
    if (currentHistoryPage > totalPages) {
        currentHistoryPage = totalPages || 1;
    }

    historyPageInfo.textContent = `${currentHistoryPage}/${totalPages}`;
    historyPrevPage.disabled = currentHistoryPage === 1;
    historyNextPage.disabled = currentHistoryPage === totalPages;

    const startIndex = (currentHistoryPage - 1) * PAGE_SIZE;
    const pageData = filteredHistory.slice(startIndex, startIndex + PAGE_SIZE);

    historyList.innerHTML = '';
    pageData.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="item-content">
                <span class="title">${item.movieName}</span>
                <span class="time">${new Date(item.timestamp).toLocaleString()}</span>
            </div>
            <button class="delete-btn">删除</button>
        `;
        
        // 点击内容区域显示格式化内容
        div.querySelector('.item-content').onclick = () => {
            document.getElementById('outputText').textContent = item.formatted;
        };
        
        // 点击删除按钮
        div.querySelector('.delete-btn').onclick = (e) => {
            e.stopPropagation();
            const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            const realIndex = startIndex + index;
            allHistory.splice(realIndex, 1);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
            loadHistory(searchTerm);
        };
        
        historyList.appendChild(div);
    });
}

// 修改加载保存链接函数中的列表项显示
function loadSavedLinks() {
    const links = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
    
    // 应用搜索过滤
    const filteredLinks = links.filter(item => 
        item.title.toLowerCase().includes(searchLinksText.toLowerCase()) ||
        item.link.toLowerCase().includes(searchLinksText.toLowerCase())
    );

    const totalPages = Math.ceil(filteredLinks.length / PAGE_SIZE);
    if (currentLinksPage > totalPages) {
        currentLinksPage = totalPages || 1;
    }

    linksPageInfo.textContent = `${currentLinksPage}/${totalPages}`;
    linksPrevPage.disabled = currentLinksPage === 1;
    linksNextPage.disabled = currentLinksPage === totalPages;

    const startIndex = (currentLinksPage - 1) * PAGE_SIZE;
    const pageData = filteredLinks.slice(startIndex, startIndex + PAGE_SIZE);

    savedLinks.innerHTML = '';
    pageData.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="item-content">
                <span class="title">${item.title}</span>
                <span class="link">${item.link}</span>
                <span class="time">${new Date(item.timestamp).toLocaleString()}</span>
            </div>
            <button class="delete-btn" type="button">删除</button>
        `;
        
        div.querySelector('.item-content').onclick = () => {
            movieTitle.value = item.title;
            movieLink.value = item.link;
        };
        
        div.querySelector('.delete-btn').onclick = (e) => {
            e.stopPropagation();
            const allLinks = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
            const realIndex = links.findIndex(link => 
                link.title === item.title && 
                link.link === item.link && 
                link.timestamp === item.timestamp
            );
            if (realIndex !== -1) {
                allLinks.splice(realIndex, 1);
                localStorage.setItem(LINKS_KEY, JSON.stringify(allLinks));
                loadSavedLinks();
            }
        };
        
        savedLinks.appendChild(div);
    });
}

// 保存到历记录
function saveToHistory(original, formatted, movieName) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.unshift({
        original,
        formatted,
        movieName,
        timestamp: Date.now()
    });
    
    if (history.length > 20) {
        history.pop();
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    loadHistory();
}

// 添加分页事件监听
historyPrevPage.addEventListener('click', () => {
    if (currentHistoryPage > 1) {
        currentHistoryPage--;
        loadHistory(searchHistory.value);
    }
});

historyNextPage.addEventListener('click', () => {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const totalPages = Math.ceil(history.length / PAGE_SIZE);
    if (currentHistoryPage < totalPages) {
        currentHistoryPage++;
        loadHistory(searchHistory.value);
    }
});

linksPrevPage.addEventListener('click', () => {
    if (currentLinksPage > 1) {
        currentLinksPage--;
        loadSavedLinks();
    }
});

linksNextPage.addEventListener('click', () => {
    const links = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
    const totalPages = Math.ceil(links.length / PAGE_SIZE);
    if (currentLinksPage < totalPages) {
        currentLinksPage++;
        loadSavedLinks();
    }
});

// 确保在页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 获取导出历史记录按钮
    const exportHistory = document.getElementById('exportHistory');

    // 加载SheetJS库
    function loadSheetJS() {
        return new Promise((resolve, reject) => {
            if (window.XLSX) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js";
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load SheetJS'));
            document.head.appendChild(script);
        });
    }

    // 添加导出历史记录功能
    exportHistory.addEventListener('click', async () => {
        try {
            await loadSheetJS();
            
            const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            if (history.length === 0) {
                alert('没有可导出的历史记录');
                return;
            }

            // 准备Excel数据
            const excelData = history.map(item => ({
                '时间': new Date(item.timestamp).toLocaleString(),
                '电影名称': item.title,
                '内容': item.formattedContent
            }));

            // 创建工作簿和工作表
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            // 设置列宽
            const colWidths = [
                { wch: 20 },  // 时间
                { wch: 30 },  // 电影名称
                { wch: 100 }  // 内容
            ];
            ws['!cols'] = colWidths;

            // 添加工作表到工作簿
            XLSX.utils.book_append_sheet(wb, ws, "历史记录");

            // 导出文件
            XLSX.writeFile(wb, `历史记录_${new Date().toLocaleDateString()}.xlsx`);
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败，请刷新页面重试');
        }
    });
});
 