// script.js
let recipeData = {};
let finalShoppingList = {}; // 최종 장보기 목록을 담을 그릇

// 1. 페이지 로드 완료 시 실행
window.onload = async function() {
    console.log("1. 데이터를 불러옵니다...");
    await loadRecipeData();
    
    // 검색창 입력 이벤트 연결
    const searchInput = document.getElementById('recipeSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            updateDropdown(e.target.value);
        });
    }

    // 계산하기 버튼 클릭 이벤트 연결
    const calcBtn = document.getElementById('calcBtn');
    if (calcBtn) {
        calcBtn.addEventListener('click', startCalculate); 
    }
};

// 2. 외부 JSON 데이터 불러오기 함수
async function loadRecipeData() {
    try {
        const response = await fetch('recipes.json');
        if (!response.ok) throw new Error("JSON 파일을 찾을 수 없습니다.");
        
        const rawData = await response.json();
        
        // 엑셀 리스트 형식을 프로그램용 계층형 구조로 변환
        rawData.forEach(row => {
            const dish = row.요리명;
            if (!recipeData[dish]) recipeData[dish] = [];
            recipeData[dish].push({
                item: row.재료명,
                qty: parseInt(row.수량),
                price: parseInt(row.가격 || 0),
                source: row.수급처,
                npc: row.NPC
            });
        });
        
        updateDropdown();
        console.log("데이터 로드 성공!");
    } catch (error) {
        console.error("데이터 로딩 실패:", error);
    }
}

// 3. 드롭다운 목록 업데이트 함수
function updateDropdown(filter = "") {
    const select = document.getElementById('mainRecipe');
    if (!select) return;
    select.innerHTML = "";
    
    // 검색어가 포함된 요리만 필터링
    const keys = Object.keys(recipeData).filter(name => name.includes(filter));
    keys.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.innerHTML = name;
        select.appendChild(opt);
    });
}

// 4. 핵심! 계산 시작 함수 (이 부분이 누락되어 에러가 났던 것입니다)
function startCalculate() {
    const dish = document.getElementById('mainRecipe').value;
    const qtyInput = document.getElementById('count');
    const qty = parseInt(qtyInput.value);
    const treeView = document.getElementById('treeView');
    
    if (!dish || isNaN(qty)) {
        alert("요리를 선택하고 수량을 입력해주세요!");
        return;
    }

    finalShoppingList = {}; // 초기화
    treeView.innerHTML = ""; // 초기화
    
    // 트리 구조 계산 시작
    renderTree(dish, qty, treeView, 0);
    // 최종 장보기 목록 합계 계산
    renderTotal();
    
    // 결과 영역 표시
    document.getElementById('resultArea').style.display = 'block';
}

// 5. 계층형 트리 구조 그리기 (재귀 함수)
function renderTree(itemName, amount, container, depth) {
    const ingredients = recipeData[itemName];
    if (!ingredients) return;

    const div = document.createElement('div');
    div.style.marginLeft = (depth * 20) + "px";
    div.innerHTML = `<strong>[${itemName}]</strong> x ${amount}개`;
    container.appendChild(div);

    ingredients.forEach(ing => {
        const totalIngQty = ing.qty * amount;
        const p = document.createElement('div');
        p.className = 'nested';
        p.innerHTML = `ㄴ ${ing.item} : ${totalIngQty}개 <span class="npc-badge">${ing.npc}</span>`;
        container.appendChild(p);

        // 하위 재료가 또 요리라면 안으로 더 들어감
        if (recipeData[ing.item]) {
            renderTree(ing.item, totalIngQty, container, depth + 1);
        } else {
            // 더 이상 하위가 없는 원재료만 최종 장보기 목록에 합산
            if (!finalShoppingList[ing.item]) {
                finalShoppingList[ing.item] = { qty: 0, npc: ing.npc, price: ing.price };
            }
            finalShoppingList[ing.item].qty += totalIngQty;
        }
    });
}

// 6. 최종 합계 장보기 목록 출력 함수
function renderTotal() {
    const tbody = document.getElementById('totalList');
    if (!tbody) return;
    tbody.innerHTML = "";
    
    for (const [name, info] of Object.entries(finalShoppingList)) {
        const row = `<tr class="total-row">
            <td><strong>${name}</strong></td>
            <td>${info.qty}개</td>
            <td><span class="npc-badge">${info.npc}</span></td>
        </tr>`;
        tbody.innerHTML += row;
    }
}
