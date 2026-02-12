let recipeData = {}; // 데이터를 담을 전역 변수

// 1. 페이지 로드 시 실행되는 초기화 함수
window.onload = async function() {
    await loadRecipeData(); // 데이터 불러오기 기다림
    
    // 검색창 이벤트 연결
    document.getElementById('recipeSearch').addEventListener('input', (e) => {
        updateDropdown(e.target.value);
    });

    // 계산 버튼 이벤트 연결
    document.getElementById('calcBtn').addEventListener('click', startCalculate);
};

// 2. 외부 JSON 파일을 읽어와서 프로그램용으로 가공하는 함수
async function loadRecipeData() {
    try {
        const response = await fetch('recipes.json'); // 파일 가져오기
        const rawData = await response.json();
        
        // 엑셀의 평면적 구조를 계층형 구조로 변환
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
        
        updateDropdown(); // 첫 드롭다운 채우기
        console.log("데이터 로드 성공!");
    } catch (error) {
        console.error("데이터를 불러오지 못했습니다. 서버 환경인지 확인하세요.", error);
    }
}

// 3. 드롭다운 업데이트 (필터 기능)
function updateDropdown(filter = "") {
    const select = document.getElementById('mainRecipe');
    select.innerHTML = "";
    
    // 요리명들만 골라서 검색어 필터링
    const keys = Object.keys(recipeData).filter(name => name.includes(filter));
    
    keys.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.innerHTML = name;
        select.appendChild(opt);
    });
}

// ... (이후 startCalculate, renderTree, renderTotal 함수는 이전과 동일)