function checkAllGames(reverse = true)
{
    let checkboxes = document.querySelectorAll('.game-checkbox');
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = reverse ? !checkbox.checked: true;
        let changeEvent = new Event('change');
        // 触发 change 事件
        checkbox.dispatchEvent(changeEvent);
    });
}
function addEventByClass(className, call, event)
{
    if(!event) event = 'click';
    let dom = document.getElementsByClassName(className);
    for(let i = 0; i < dom.length; i++){
        const eventListeners = dom[i].listeners || {};
        if (!eventListeners[event]) {
            dom[i].addEventListener(event, call);
            eventListeners[event] = true;
            dom[i].listeners = eventListeners;
        }
    }
}

function getIframe()
{
    let iframe = document.getElementsByClassName('ke-edit-iframe')[0];
    if(!iframe) return null;
    let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    return iframeDocument.querySelector('.article-content');
}


function insertGamesToDetail()
{
    // iframe
    let targetElement = getIframe();
    let games = document.getElementsByClassName('game-checkbox'), gamesArray = [];
    for(let i in games){
        if(games[i].checked){
            gamesArray.push(games[i].value);
        }
    }
    let regex = /(<p>)*--!([\s\S]*?)!--(<\/p>)*/g;
    let matches = targetElement.innerHTML.match(regex);
    let content = targetElement.innerHTML;
    if(matches){
        content = content.replace(matches[0], `<p>--!${gamesArray.join(',')}!--</p>`);
        targetElement.innerHTML = content;
    }else{
        targetElement.innerHTML = content + `<p>--!${gamesArray.join(',')}!--</p>`;
    }
}

function getGamesFromDetail()
{
    // iframe
    let targetElement = getIframe();
    let regex = /(<p>)*--!([\s\S]*?)!--(<\/p>)*/g;
    let matches = targetElement.innerHTML.match(regex);
    if(matches){
        matches[0] = matches[0].replace('<p>', '')
            .replace('</p>', '')
            .replace('--!', '')
            .replace('!--', '');
        return matches[0].split(',');
    }else{
        return [];
    }
}
function addGameEvent()
{
    document.getElementById('game-select-all').addEventListener('click', () => checkAllGames(false));
    document.getElementById('game-select-reverse').addEventListener('click', () => checkAllGames(true));
    addEventByClass('game-checkbox', () => insertGamesToDetail(), 'change');
}
function insertGames(type)
{
    if(!getIframe()) return;
    requestJSON('http://172.16.5.205/zentao_stat/assets/zentao.json').then(function(games){
        if(type === 'edit'){
            let gamesFromDetail = getGamesFromDetail();
            let details = document.getElementsByClassName('detail');
            console.log(gamesFromDetail);
            if(details && details[0]){
                let gamesHtml = '<div class="detail"><div class="detail-title">研发项目<button id="game-select-all" type="button">全选</button><button id="game-select-reverse" type="button">反选</button></div><div class="detail-content">';
                for(let i in games){
                    let checked = gamesFromDetail.indexOf(games[i]) > -1? 'checked' : '';
                    gamesHtml += `<div class="game-name-item"><input class="game-checkbox" ${checked} type="checkbox" id="game-name-${i}" value="${games[i]}"/>` +
                        `<label for="game-name-${i}">${games[i]}</label></div>`;
                }
                gamesHtml += '</div></div>';
                details[0].insertAdjacentHTML('afterend', gamesHtml);
                // 监听事件
                addGameEvent();
            }
        }else{
            let form = document.getElementById('dataform');
            if(!form) return;
            let trs = form.querySelectorAll('tr');
            if(trs && trs[8]){
                let gamesHtml = '<tr><th>研发项目<button id="game-select-all" type="button">全选</button><button id="game-select-reverse" type="button">反选</button></th><th colspan="3" class="game-th">';
                for(let i in games){
                    gamesHtml += `<div class="game-name-item"><input class="game-checkbox" type="checkbox" id="game-name-${i}" value="${games[i]}"/>` +
                        `<label for="game-name-${i}">${games[i]}</label></div>`;
                }
                gamesHtml += '</th></tr>';
                trs[8].insertAdjacentHTML('afterend', gamesHtml);
                // 监听事件
                addGameEvent();
            }
        }
    });
}
function requestJSON(url, data)
{
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        const headers = {
            'Content-Type': 'application/json'
        };
        if(data){
            xhr.open('POST', url);
        }else{
            xhr.open('GET', url);
        }
        for (const header in headers) {
            xhr.setRequestHeader(header, headers[header]);
        }
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(xhr.statusText);
                }
            }
        };
        if(data){
            xhr.send(JSON.stringify(data));
        }else{
            xhr.send();
        }
    });
}
function executionCreate()
{
    let selectElement = document.getElementById('teamMembers');
    if(!selectElement) return;

    let nameElement = document.getElementsByClassName('user-profile-name');
    if(!nameElement) return;

    let name = nameElement[0].innerText;

    // 全选团队
    let optionElements = selectElement.options;
    for (let i = 0; i < optionElements.length; i++) {
        optionElements[i].selected = true;
    }
    // 自动选择迭代负责人
    let pmSelectElement = document.getElementById('PM');
    let pmOptionElements = pmSelectElement.options;
    for (let i = 0; i < pmOptionElements.length; i++) {
        console.log(pmOptionElements[i].innerText);
        if(pmOptionElements[i].innerText.indexOf(name) > -1){
            pmOptionElements[i].selected = true;
            document.getElementById('PM_chosen').querySelector('span').innerText = name;
        }
    }
}

if (window.location.href.indexOf('/zentao/task-edit-') > 0) {
    insertGames('edit');
}else if(window.location.href.indexOf('/zentao/task-create-') > 0){
    insertGames('create');
}else if(window.location.href.indexOf('/zentao/execution-create') > 0){
    executionCreate();
}

