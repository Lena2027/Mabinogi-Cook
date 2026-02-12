let recipeData = {};

window.onload = async function() {
    console.log("1. 페이지 로드 완료 - 데이터를 불러옵니다...");
    await loadRecipeData();
    
    document.getElementById('recipeSearch').addEventListener('input', (e) => {
        updateDropdown(e.target.value);
    });

    document.getElementById('calcBtn').addEventListener('click', startCalculate);
};

async function loadRecipeData() {
    try {
        const response = await fetch('recipes.json');
        if (!response.ok) throw new Error("파일을 찾을 수 없습니다.");
        
        const rawData = await response.json();
        console.log("2. 데이터 읽기 성공:", rawData);

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
        console.log("3. 데이터 가공 완료! 요리 개수:", Object.keys(recipeData).length);
    } catch (error) {
        console.error("❌ 에러 발생:", error.message);
        alert("데이터 로드 실패! F12 눌러서 에러를 확인하세요.");
    }
}

// ... (updateDropdown, startCalculate 등 나머지 함수는 이전과 동일)
