// DOM 元素
let movieTitle;
let movieLink;
let addLinkBtn;
let contentInput;
let formatBtn;
let copyBtn;
let clearBtn;
let searchHistory;
let historyList;
let savedLinks;
let searchLinks;
let exportLinks;
let importLinks;
let fileInput;

// 分页元素
let historyPrevPage;
let historyNextPage;
let historyPageInfo;
let linksPrevPage;
let linksNextPage;
let linksPageInfo;

// 确认对话框元素
let confirmModal;
let confirmDelete;
let cancelDelete;

// 本地存储键
const HISTORY_KEY = 'articleHistory';
const LINKS_KEY = 'savedLinks';

// 分页配置
const PAGE_SIZE = 10;
let currentHistoryPage = 1;
let currentLinksPage = 1;
let searchLinksText = '';
let deleteItemCallback = null;

// 等待DOM加载完成后再初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化DOM元素
    initializeDOMElements();
    // 初始化样式
    initializeStyles();
    // 初始化事件监听器
    initializeEventListeners();
    // 加载数据
    loadHistory();
    loadSavedLinks();
});

// 初始化DOM元素
function initializeDOMElements() {
    movieTitle = document.getElementById('movieTitle');
    movieLink = document.getElementById('movieLink');
    addLinkBtn = document.getElementById('addLink');
    contentInput = document.getElementById('contentInput');
    formatBtn = document.getElementById('formatBtn');
    copyBtn = document.getElementById('copyBtn');
    clearBtn = document.getElementById('clearBtn');
    searchHistory = document.getElementById('searchHistory');
    historyList = document.getElementById('historyList');
    savedLinks = document.getElementById('savedLinks');
    searchLinks = document.getElementById('searchLinks');
    exportLinks = document.getElementById('exportLinks');
    importLinks = document.getElementById('importLinks');
    fileInput = document.getElementById('fileInput');

    historyPrevPage = document.getElementById('historyPrevPage');
    historyNextPage = document.getElementById('historyNextPage');
    historyPageInfo = document.getElementById('historyPageInfo');
    linksPrevPage = document.getElementById('linksPrevPage');
    linksNextPage = document.getElementById('linksNextPage');
    linksPageInfo = document.getElementById('linksPageInfo');

    confirmModal = document.getElementById('confirmModal');
    confirmDelete = document.getElementById('confirmDelete');
    cancelDelete = document.getElementById('cancelDelete');
}

// 初始化样式
function initializeStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        min-width: 300px;
    }

    .modal-buttons {
        margin-top: 20px;
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    .delete-btn {
        padding: 4px 8px;
        background-color: #ff4d4f;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .history-item:hover .delete-btn {
        opacity: 1;
    }

    .delete-btn:hover {
        background-color: #ff7875;
    }
    `;
    document.head.appendChild(styleSheet);
}

// 显示确认对话框
function showConfirmModal(callback) {
    console.log('显示确认对话框');
    deleteItemCallback = callback;
    confirmModal.style.display = 'flex';
    
    // 添加点击外部关闭功能
    const closeOnOutsideClick = (e) => {
        if (e.target === confirmModal) {
            hideConfirmModal();
            confirmModal.removeEventListener('click', closeOnOutsideClick);
        }
    };
    confirmModal.addEventListener('click', closeOnOutsideClick);
}

// 隐藏确认对话框
function hideConfirmModal() {
    console.log('隐藏确认对话框');
    confirmModal.style.display = 'none';
    deleteItemCallback = null;
}

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    searchLinks.addEventListener('input', (e) => {
        searchLinksText = e.target.value;
        currentLinksPage = 1;
        loadSavedLinks();
    });

    // 分页事件
    linksPrevPage.addEventListener('click', () => {
        console.log('上一页按钮被点击');
        if (currentLinksPage > 1) {
            currentLinksPage--;
            loadSavedLinks();
        }
    });

    linksNextPage.addEventListener('click', () => {
        console.log('下一页按钮被点击');
        const links = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
        const filteredLinks = links.filter(item => 
            item.title.toLowerCase().includes(searchLinksText.toLowerCase()) ||
            item.link.toLowerCase().includes(searchLinksText.toLowerCase())
        );
        const totalPages = Math.ceil(filteredLinks.length / PAGE_SIZE);
        
        if (currentLinksPage < totalPages) {
            currentLinksPage++;
            loadSavedLinks();
        }
    });

    // 确认对话框事件
    confirmDelete.addEventListener('click', () => {
        console.log('确认删除');
        if (deleteItemCallback) {
            deleteItemCallback();
        }
        hideConfirmModal();
    });

    cancelDelete.addEventListener('click', () => {
        console.log('取消删除');
        hideConfirmModal();
    });

    // 添加链接事件
    addLinkBtn.addEventListener('click', () => {
        const title = movieTitle.value.trim();
        const link = movieLink.value.trim();
        
        if (!title || !link) {
            alert('请输入电影名称和链接地址');
            return;
        }

        // 验证链接格式
        try {
            new URL(link);
        } catch (e) {
            alert('请输入有效的链接地址');
            return;
        }

        const links = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
        
        // 检查重复链接
        const isDuplicate = links.some(item => item.link === link);
        if (isDuplicate) {
            alert('该链接已存在');
            return;
        }

        // 检查存储限制
        if (links.length >= 1000) {
            alert('链接数量已达到上限，请删除一些旧链接');
            return;
        }

        links.unshift({ title, link, timestamp: Date.now() });
        localStorage.setItem(LINKS_KEY, JSON.stringify(links));
        
        movieTitle.value = '';
        movieLink.value = '';
        loadSavedLinks();
    });

    // 清空输入按钮事件
    clearBtn.addEventListener('click', () => {
        console.log('点击清空按钮');
        contentInput.value = '';
        document.getElementById('outputText').textContent = '';
    });

    // 复制内容按钮事件
    copyBtn.addEventListener('click', () => {
        console.log('点击复制按钮');
        const content = document.getElementById('outputText').textContent;
        if (!content) {
            alert('没有可复制的内容');
            return;
        }

        navigator.clipboard.writeText(content)
            .then(() => {
                console.log('内容已复制');
            })
            .catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制');
            });
    });

    // 格式化内容按钮事件
    formatBtn.addEventListener('click', () => {
        console.log('点击格式化按钮');
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
资源完全免费；不会收取您任何费用，资源搜集于互联网公开分享资源，如有侵权联系立删`;

        // 显示格式化后的内容
        document.getElementById('outputText').textContent = formattedContent;
        
        // 保存到历史记录
        saveToHistory(content, formattedContent, movieName);
    });

    // 历史记录分页事件
    historyPrevPage.addEventListener('click', () => {
        console.log('历史记录上一页按钮被点击');
        if (currentHistoryPage > 1) {
            currentHistoryPage--;
            loadHistory(searchHistory.value);
        }
    });

    historyNextPage.addEventListener('click', () => {
        console.log('历史记录下一页按钮被点击');
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        const filteredHistory = history.filter(item => {
            const searchTerm = searchHistory.value.toLowerCase();
            const title = item.movieName || '';
            return title.toLowerCase().includes(searchTerm);
        });
        const totalPages = Math.ceil(filteredHistory.length / PAGE_SIZE);
        
        if (currentHistoryPage < totalPages) {
            currentHistoryPage++;
            loadHistory(searchHistory.value);
        }
    });

    // 历史记录搜索
    searchHistory.addEventListener('input', (e) => {
        currentHistoryPage = 1;
        loadHistory(e.target.value);
    });

    // 导出链接按钮事件
    exportLinks.addEventListener('click', async () => {
        console.log('点击导出按钮');
        const links = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
        if (links.length === 0) {
            alert('没有可导出的链接');
            return;
        }

        try {
            // 确保XLSX对象存在
            if (typeof XLSX === 'undefined') {
                await loadSheetJS();
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
            console.log('导出成功');
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败，请刷新页面重试');
        }
    });

    // 导入链接按钮事件
    importLinks.addEventListener('click', () => {
        console.log('点击导入按钮');
        fileInput.click();
    });

    // 文件输入框变化事件
    fileInput.addEventListener('change', async (e) => {
        console.log('选择文件');
        const file = e.target.files[0];
        if (!file) return;

        try {
            // 确保XLSX对象存在
            if (typeof XLSX === 'undefined') {
                await loadSheetJS();
            }

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
                    console.log('导入成功');
                    alert('导入成功！');
                } catch (error) {
                    console.error('导入失败:', error);
                    alert('导入失败，请确保文件格式正确');
                }
            };
            reader.readAsArrayBuffer(file);
            fileInput.value = ''; // 重置文件输入框
        } catch (error) {
            console.error('导入失败:', error);
            alert('导入失败，请刷新页面重试');
        }
    });
}

// 加载保存的链接
function loadSavedLinks() {
    console.log('加载链接列表');
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

    console.log('当前页码:', currentLinksPage, '总页数:', totalPages);
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
        
        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            console.log('点击删除按钮');
            showConfirmModal(() => {
                console.log('执行删除操作');
                const allLinks = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
                const realIndex = allLinks.findIndex(link => 
                    link.title === item.title && 
                    link.link === item.link && 
                    link.timestamp === item.timestamp
                );
                if (realIndex !== -1) {
                    allLinks.splice(realIndex, 1);
                    localStorage.setItem(LINKS_KEY, JSON.stringify(allLinks));
                    loadSavedLinks();
                }
            });
        };
        
        savedLinks.appendChild(div);
    });
}

// 在文件开头添加 SheetJS CDN
document.head.innerHTML += '<script src="https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js"></script>';

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
资源完全免费；不会收取您任何费用，资源搜集于互联网公开分享资源，如有侵权联系立删`;

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
        .then(() => {
            console.log('内容已复制');
        })
        .catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
        });
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

// 加载历史记录
function loadHistory(searchTerm = '') {
    console.log('加载历史记录，当前页码：', currentHistoryPage);
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    
    // 应用搜索过滤
    const filteredHistory = history.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const title = item.movieName || '';
        return title.toLowerCase().includes(searchLower);
    });

    const totalPages = Math.ceil(filteredHistory.length / PAGE_SIZE);
    if (currentHistoryPage > totalPages) {
        currentHistoryPage = totalPages || 1;
    }

    console.log('历史记录总页数：', totalPages);
    historyPageInfo.textContent = `${currentHistoryPage}/${totalPages}`;
    historyPrevPage.disabled = currentHistoryPage === 1;
    historyNextPage.disabled = currentHistoryPage === totalPages;

    const startIndex = (currentHistoryPage - 1) * PAGE_SIZE;
    const pageData = filteredHistory.slice(startIndex, startIndex + PAGE_SIZE);

    historyList.innerHTML = '';
    pageData.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="item-content">
                <span class="title">${item.movieName || ''}</span>
                <span class="time">${new Date(item.timestamp).toLocaleString()}</span>
            </div>
            <button class="delete-btn" type="button">删除</button>
        `;
        
        // 点击内容区域显示格式化内容
        div.querySelector('.item-content').onclick = () => {
            document.getElementById('outputText').textContent = item.formatted || '';
        };
        
        // 删除按钮事件
        div.querySelector('.delete-btn').onclick = (e) => {
            e.stopPropagation();
            showConfirmModal(() => {
                const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
                const realIndex = allHistory.findIndex(h => 
                    h.movieName === item.movieName && 
                    h.timestamp === item.timestamp
                );
                if (realIndex !== -1) {
                    allHistory.splice(realIndex, 1);
                    localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
                    loadHistory(searchTerm);
                }
            });
        };
        
        historyList.appendChild(div);
    });
}

// 保存到历史记录
function saveToHistory(originalContent, formattedContent, movieName) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.unshift({
        movieName,  // 保持原有的字段名
        original: originalContent,  // 保持原有的字段名
        formatted: formattedContent,  // 保持原有的字段名
        timestamp: Date.now()
    });
    
    // 限制历史记录数量
    if (history.length > 100) {
        history.pop();
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    loadHistory();
}

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
 