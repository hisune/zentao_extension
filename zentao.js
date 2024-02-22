function checkAllGames(reverse = true, index)
{
    let checkboxes = document.querySelectorAll('.game-checkbox');
    checkboxes.forEach(function(checkbox) {
        if(checkbox.dataset.index !== index){
            return;
        }
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
    let gamesString = gamesArray.length > 0 ? `<p>--!${gamesArray.join(',')}!--</p>` : '';
    if(matches){
        content = content.replace(matches[0], gamesString);
        targetElement.innerHTML = content;
    }else{
        targetElement.innerHTML = content + gamesString;
    }
    document.getElementsByClassName('kindeditor-ph')[0].innerText = '';
    document.getElementById('desc').value = targetElement.innerHTML;
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
    document.querySelectorAll('.game-select-all').forEach(function(item){
        item.addEventListener('click', function(){
            checkAllGames(false, this.dataset.index);
        })
    });
    document.querySelectorAll('.game-select-reverse').forEach(function(item){
        item.addEventListener('click', function(){
            checkAllGames(true, this.dataset.index);
        });
    });
    addEventByClass('game-checkbox', () => insertGamesToDetail(), 'change');
}
function insertGamesHtml(dom, games, type)
{
    let wrapperBegin = '<tr><th>', wrapperMiddle = '</th><th colspan="3" class="game-th">', wrapperEnd = '</th></tr>';
    if(type === 'div'){
        wrapperBegin = '<div class="detail"><div class="detail-title">';
        wrapperMiddle = '</div><div class="detail-content">';
        wrapperEnd = '</div></div>';
    }
    let gamesHtml = wrapperBegin + '所属游戏'
        + wrapperMiddle
        + `<div style="font-weight: normal;background: aliceblue;padding: 4px;border: antiquewhite 1px solid;">说明：1. 迭代、父任务、子任务均可设置；2. <b>统计优先级</b>：子任务 > 父任务 > 迭代；3. <b>迭代下所有任务游戏相同</b> => 设置迭代的游戏即可，<b>迭代下的任务游戏不同</b> => 为每个任务单独设置游戏</div>`;
    let gamesFromDetail = getGamesFromDetail();
    for(let i in games){
        gamesHtml += `<div class="game-name"><b>${games[i]['group']}</b>&nbsp;<button class="game-select-all" data-index="${i}" type="button">全选</button><button class="game-select-reverse" data-index="${i}" type="button">反选</button></div>`;
        for(let j in games[i]['games']){
            let checked = gamesFromDetail.indexOf(games[i]['games'][j]) > -1? 'checked' : '';
            gamesHtml += `<div class="game-name-item"><input class="game-checkbox" data-index="${i}" ${checked} type="checkbox" id="game-name-${i}-${j}" value="${games[i]['games'][j]}"/>` +
                `<label for="game-name-${i}-${j}">${games[i]['games'][j]}</label></div>`;
        }
    }
    gamesHtml += wrapperEnd;
    dom.insertAdjacentHTML('afterend', gamesHtml);
    addGameEvent();
}
function insertGames(type, callback)
{
    if(!getIframe()) return;
    if(document.getElementById('game-select-all')) return;

    requestJSON('http://172.16.5.205/zentao_stat/assets/zentao_games.json').then(function(games){
        if(document.getElementById('game-select-all')) return;
        if(type === 'div'){
            let details = document.getElementsByClassName('detail');
            if(details && details[0]){
                insertGamesHtml(details[0], games, 'div');
            }
        }else{
            let form = document.getElementById('dataform');
            if(!form) return;
            let trs = form.querySelectorAll('tr');
            if(trs && trs[8]){
                insertGamesHtml(trs[8], games, 'table');
            }
        }
        if(callback) callback();
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
function getMyselfName()
{
    let nameElement = document.getElementsByClassName('user-profile-name');
    if(!nameElement) return;

    return nameElement[0].innerText;
}
function executionCreate()
{
    let selectElement = document.getElementById('teamMembers');
    if(!selectElement) return;

    console.log('execute create');

    // 自动选择计划起止日期为7填
    document.getElementById('delta7').click();

    // 自动选择项目
    let projectElement = document.getElementById('project');
    if(!projectElement.options[1].selected){
        projectElement.options[1].selected = true;
        let changeEvent = new Event('change');
        projectElement.dispatchEvent(changeEvent);
    }

    // 全选团队
    let optionElements = selectElement.options;
    for (let i = 0; i < optionElements.length; i++) {
        optionElements[i].selected = true;
    }
    // 自动选择迭代负责人
    autoSelectMyself('PM', 'PM_chosen')

    // 创建提醒
    addSteps([
        [document.getElementById('dataform').querySelectorAll('tr')[2].querySelector('th')],
        [document.getElementById('dataform').querySelectorAll('tr')[3].querySelector('th'), '可修改'],
        [document.getElementById('dataform').querySelectorAll('tr')[9].querySelector('th')],
    ]);
}

function taskCreate()
{
    console.log('task create');
    // 自动选择指派给
    autoSelectMyself('assignedTo', 'assignedTo_chosen')

    // 创建提醒
    addSteps([
        [document.getElementById('dataform').querySelectorAll('tr')[1].querySelector('th')],
        [document.getElementById('dataform').querySelectorAll('tr')[2].querySelector('th')],
        [document.getElementById('dataform').querySelectorAll('tr')[8].querySelector('th')],
        [document.getElementById('dataform').querySelectorAll('tr')[9].querySelector('th')],
    ]);
}

function addSteps(steps)
{
    for(let i in steps){
        let step = parseInt(i) + 1;
        let tips = steps[i][1] ? '(' + steps[i][1] + ')' : '';
        steps[i][0].insertAdjacentHTML('afterbegin', `<span style="color: red; font-weight: bold">第${step}步${tips}</span><br>`);
    }
}

function autoSelectMyself(selectId, chosenId)
{
    let pmSelectElement = document.getElementById(selectId);
    if(!pmSelectElement) return;
    let name = getMyselfName();

    let pmOptionElements = pmSelectElement.options;
    for (let i = 0; i < pmOptionElements.length; i++) {
        if(pmOptionElements[i].innerText.indexOf(name) > -1){
            pmOptionElements[i].selected = true;
            console.log('auto select ' + name);
            document.getElementById(chosenId).querySelector('span').innerText = name;
        }
    }
}

if (window.location.href.indexOf('/zentao/task-edit-') > 0) {
    insertGames('div');
}else if(window.location.href.indexOf('/zentao/task-create-') > 0){
    insertGames('table', () => taskCreate());
}else if(window.location.href.indexOf('/zentao/execution-create') > 0){
    insertGames('table', () => executionCreate())
}else if(window.location.href.indexOf('/zentao/execution-edit') > 0){
    insertGames('table')
}

