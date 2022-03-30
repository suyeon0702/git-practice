import StudentInfo from '../models/Student_Info'

export const matching = async (request, response) => {
    try {
        // 친구, 연인
        const friend = await StudentInfo.find({KoM: '친구'})
        console.log('친구:', friend)
        const couple = await StudentInfo.find({KoM: '연인'})
        console.log('연인:', couple)
        const exercise = await StudentInfo.find({KoM: '운동'})
        console.log('운동:', exercise)

        // 지역
        const regions = 15
        let fF = Array.from(Array(regions), () => new Array()) // 친구 매칭 선택자들을 지역 별로 분류
        let cF = Array.from(Array(regions), () => new Array()) // 연인 매칭 선택자들을 지역 별로 분류
        let eF = Array.from(Array(regions), () => new Array()) // 운동 매칭 선택자들을 지역 별로 분류
        for(let index = 0; index < friend.length; index++) { // ex) fF[0]은 지역 번호 0번인 강남구 지역 선택자 & 친구 매칭 선택자
            for(let i = 0; i < friend[index].Field.length; i++) {
                for(let j = 0; j < regions; j++) {
                if(j == friend[index].Field[i]) fF[j].push(friend[index])
                }
            }
        }
        console.log('fF:', fF)

        for(let index = 0; index < couple.length; index++) {
            for(let i = 0; i < couple[index].Field.length; i++) {
                for(let j = 0; j < regions; j++) {
                if(j == couple[index].Field[i]) cF[j].push(couple[index])
                }
            }
        }
        console.log('cF:', cF)

        for(let index = 0; index < exercise.length; index++) {
            for(let i = 0; i < exercise[index].Field.length; i++) {
                for(let j = 0; j < regions; j++) {
                if(j == exercise[index].Field[i]) eF[j].push(exercise[index])
                }
            }
        }
        console.log('eF:', eF)

        // 각자의 선택에 맞춘 후보들 정리
        //친구 매칭
        for(let ind = 0; ind < fF.length; ind++) {
            // 지역별로 본인 MBTI 분류
            let MBTI = Array.from(Array(16), () => new Array())
            for(let inde = 0; inde < fF[ind].length; inde++) {
                for(let i = 0; i < 16; i++) {
                    if(fF[ind][inde].OwnMBTI == i) MBTI[i].push(fF[ind][inde])
                }
            }

            for(let inde = 0; inde < fF[ind].length; inde++) {
                let index = 0;
                let temp = new Array()
                // 1. 원하는 MBTI를 가진 상대방을 매칭 대상에 추가
                for(let ti = 0; ti < fF[ind][inde].WantedMBTI.length; ti++) {
                    for (let i = 0; i < MBTI[fF[ind][inde].WantedMBTI[ti]].length; i++) {
                        if(fF[ind][inde].STnumber != MBTI[fF[ind][inde].WantedMBTI[ti]][i].STnumber) {
                            temp.push(MBTI[fF[ind][inde].WantedMBTI[ti]][i])
                        }
                    }
                }

                // 2. 같은 학과 매칭 가능 여부 판단
                if(!(fF[ind][inde].SameMajor)) {
                    index = 0
                    for(let ti = 0; ti < temp.length; ti++) {
                        if(fF[ind][inde].Major === temp[ti].Major) {
                            temp.splice(index, 1)
                            index--
                        }
                        index++
                    }
                }

                // 3. 동성 매칭 가능 여부 판단
                if(!(fF[ind][inde].SameGender)) { // 이성
                    index = 0
                    for(let ti = 0; ti < temp.length; ti++) {
                        if(fF[ind][inde].Gender == temp[ti].Gender) { // 동성인 경우
                            temp.splice(index, 1)
                            index--
                        }
                        else if(temp[ti].SameGender) { // 이성이지만 상대방이 동성을 원하는 경우
                            temp.splice(index, 1)
                            index--
                        }
                        index++
                    }
                }
                else { // 동성
                    index = 0
                    for(let ti = 0; ti < temp.length; ti++) {
                        if(fF[ind][inde].Gender != temp[ti].Gender) { // 이성인 경우
                            temp.splice(index, 1)
                            index--
                        }
                        else if(!(temp[ti].SameGender)) { // 동성이지만 상대방이 이성을 원하는 경우
                            temp.splice(index, 1)
                            index--
                        }
                        index++
                    }
                }

                //점수가 반영되는 부분들
                let result = []
                let scoreList = []
                for(let ti = 0; ti < temp.length; ti++) {
                    let score = 0;
                    // 4. 쌍방 선호 MBTI
                    for(let i = 0; i < temp[ti].WantedMBTI.length; i++) {
                        if(fF[ind][inde].OwnMBTI == temp[ti].WantedMBTI[i]) {score++}
                    }

                    // 5. 군필자만 매칭 가능 여부 판단
                    if(fF[ind][inde].O_MilitaryService) {
                        for(let ti = 0; ti < temp.length; ti++) {
                            if(temp[ti].MilitaryService) {
                                score++
                            }
                        }
                    }
                    else {
                        score++
                    }

                    // 6. 흡연자 매칭 가능 여부 판단
                    if(!(fF[ind][inde].O_Smoker)) {
                        for(let ti = 0; ti < temp.length; ti++) {
                            if(!(temp[ti].Smoker)) {
                                score++
                            }
                        }
                    }
                    else {
                        score++
                    }  

                    // 결과 등록
                    if(score >= 2) {
                        result.push(Number(temp[ti].STnumber))
                        scoreList.push(Number(score))
                    } 
                }
                await StudentInfo.updateOne({STnumber: fF[ind][inde].STnumber}, {MatchedPeople: result})
                await StudentInfo.updateOne({STnumber: fF[ind][inde].STnumber}, {MatchedScore: scoreList})
            }
        }

        //연인 매칭
        for(let ind = 0; ind < cF.length; ind++) {
            // 지역별로 본인 MBTI 분류
            let MBTI = Array.from(Array(16), () => new Array())
            for(let inde = 0; inde < cF[ind].length; inde++) {
                for(let i = 0; i < 16; i++) {
                    if(cF[ind][inde].OwnMBTI == i) MBTI[i].push(cF[ind][inde])
                }
            }
        
            for(let inde = 0; inde < cF[ind].length; inde++) {
                let index = 0
                let temp = new Array()
                // 1. 원하는 MBTI를 가진 상대방을 매칭 대상에 추가
                for(let ti = 0; ti < cF[ind][inde].WantedMBTI.length; ti++) {
                    for (let i = 0; i < MBTI[cF[ind][inde].WantedMBTI[ti]].length; i++) {
                        if(cF[ind][inde].STnumber != MBTI[cF[ind][inde].WantedMBTI[ti]][i].STnumber) {
                            temp.push(MBTI[cF[ind][inde].WantedMBTI[ti]][i])
                        }
                    }
                }
        
                // 2. 같은 학과 매칭 가능 여부 판단
                if(!(cF[ind][inde].SameMajor)) {
                    index = 0
                    for(let ti = 0; ti < temp.length; ti++) {
                        if(cF[ind][inde].Major === temp[ti].Major) {
                            temp.splice(index, 1)
                            index--
                        }
                        index++
                    }
                }
        
                // 3. 동성 매칭 가능 여부 판단
                if(!(cF[ind][inde].SameGender)) { // 이성
                    index = 0
                    for(let ti = 0; ti < temp.length; ti++) {
                        if(cF[ind][inde].Gender == temp[ti].Gender) { // 동성인 경우
                            temp.splice(index, 1)
                            index--
                        }
                        else if(temp[ti].SameGender) { // 이성이지만 상대방이 동성을 원하는 경우
                            temp.splice(index, 1)
                            index--
                        }
                        index++
                    }
                }
                else { // 동성
                    index = 0
                    for(let ti = 0; ti < temp.length; ti++) {
                        if(cF[ind][inde].Gender != temp[ti].Gender) { // 이성인 경우
                            temp.splice(index, 1)
                            index--
                        }
                        else if(!(temp[ti].SameGender)) { // 동성이지만 상대방이 이성을 원하는 경우
                            temp.splice(index, 1)
                            index--
                        }
                        index++
                    }
                }
        
                //점수가 반영되는 부분들
                let result = []
                let scoreList = []
                for(let ti = 0; ti < temp.length; ti++) {
                    let score = 0;
                    // 4. 쌍방 선호 MBTI
                    for(let i = 0; i < temp[ti].WantedMBTI.length; i++) {
                        if(cF[ind][inde].OwnMBTI == temp[ti].WantedMBTI[i]) {score++}
                    }
        
                    // 5. 군필자만 매칭 가능 여부 판단
                    if(cF[ind][inde].O_MilitaryService) {
                        for(let ti = 0; ti < temp.length; ti++) {
                            if(temp[ti].MilitaryService) {
                                score++
                            }
                        }
                    }
                    else {
                        score++
                    }
        
                    // 6. 흡연자 매칭 가능 여부 판단
                    if(!(cF[ind][inde].O_Smoker)) {
                        for(let ti = 0; ti < temp.length; ti++) {
                            if(!(temp[ti].Smoker)) {
                                score++
                            }
                        }
                    }
                    else {
                        score++
                    }  
        
                    // 결과 등록
                    if(score >= 2) {
                        result.push(Number(temp[ti].STnumber))
                        scoreList.push(Number(score))
                    } 
                }
                await StudentInfo.updateOne({STnumber: cF[ind][inde].STnumber}, {MatchedPeople: result})
                await StudentInfo.updateOne({STnumber: cF[ind][inde].STnumber}, {MatchedScore: scoreList})
            }
        }

        //운동 매칭
        for(let ind = 0; ind < eF.length; ind++) {
            // 지역별로 본인 MBTI 분류
            let MBTI = Array.from(Array(16), () => new Array())
            for(let inde = 0; inde < eF[ind].length; inde++) {
                for(let i = 0; i < 16; i++) {
                    if(eF[ind][inde].OwnMBTI == i) MBTI[i].push(eF[ind][inde])
                }
            }
        
            for(let inde = 0; inde < eF[ind].length; inde++) {
                let index = 0
                let temp = new Array()
                // 1. 원하는 MBTI를 가진 상대방을 매칭 대상에 추가
                for(let ti = 0; ti < eF[ind][inde].WantedMBTI.length; ti++) {
                    for (let i = 0; i < MBTI[eF[ind][inde].WantedMBTI[ti]].length; i++) {
                        if(eF[ind][inde].STnumber != MBTI[eF[ind][inde].WantedMBTI[ti]][i].STnumber) {
                            temp.push(MBTI[eF[ind][inde].WantedMBTI[ti]][i])
                        }
                    }
                }
        
                // 2. 같은 학과 매칭 가능 여부 판단
                if(!(eF[ind][inde].SameMajor)) {
                    index = 0
                    for(let ti = 0; ti < temp.length; ti++) {
                        if(eF[ind][inde].Major === temp[ti].Major) {
                            temp.splice(index, 1)
                            index--
                        }
                        index++
                    }
                }
        
                // 3. 동성 매칭 가능 여부 판단
                if(!(eF[ind][inde].SameGender)) { // 이성
                    index = 0
                    for(let ti = 0; ti < temp.length; ti++) {
                        if(eF[ind][inde].Gender == temp[ti].Gender) { // 동성인 경우
                            temp.splice(index, 1)
                            index--
                        }
                        else if(temp[ti].SameGender) { // 이성이지만 상대방이 동성을 원하는 경우
                            temp.splice(index, 1)
                            index--
                        }
                        index++
                    }
                }
                else { // 동성
                    index = 0
                    for(let ti = 0; ti < temp.length; ti++) {
                        if(eF[ind][inde].Gender != temp[ti].Gender) { // 이성인 경우
                            temp.splice(index, 1)
                            index--
                        }
                        else if(!(temp[ti].SameGender)) { // 동성이지만 상대방이 이성을 원하는 경우
                            temp.splice(index, 1)
                            index--
                        }
                        index++
                    }
                }
        
                //점수가 반영되는 부분들
                let result = []
                let scoreList = []
                for(let ti = 0; ti < temp.length; ti++) {
                    let score = 0;
                    // 4. 쌍방 선호 MBTI
                    for(let i = 0; i < temp[ti].WantedMBTI.length; i++) {
                        if(eF[ind][inde].OwnMBTI == temp[ti].WantedMBTI[i]) {score++}
                    }
        
                    // 5. 군필자만 매칭 가능 여부 판단
                    if(eF[ind][inde].O_MilitaryService) {
                        for(let ti = 0; ti < temp.length; ti++) {
                            if(temp[ti].MilitaryService) {
                                score++
                            }
                        }
                    }
                    else {
                        score++
                    }
        
                    // 6. 흡연자 매칭 가능 여부 판단
                    if(!(eF[ind][inde].O_Smoker)) {
                        for(let ti = 0; ti < temp.length; ti++) {
                            if(!(temp[ti].Smoker)) {
                                score++
                            }
                        }
                    }
                    else {
                        score++
                    }  
        
                    // 결과 등록
                    if(score >= 2) {
                        result.push(Number(temp[ti].STnumber))
                        scoreList.push(Number(score))
                    } 
                }
                await StudentInfo.updateOne({STnumber: eF[ind][inde].STnumber}, {MatchedPeople: result})
                await StudentInfo.updateOne({STnumber: eF[ind][inde].STnumber}, {MatchedScore: scoreList})
            }
        }

        return response.render('matching')
    } catch(error) {
        console.log(error)
    }
}

export const select = async (request, response) => {
    try {
        while(1) {
            const infos = await StudentInfo.find({isMatched: false}) // 매칭이 되지 않은 모든 사람들 불러오기
        
            infos.sort(function(a, b) { // 매칭 후보의 수를 비교하여 오름차순으로 정렬
                return a.MatchedPeople.length - b.MatchedPeople.length
            })
            
            let index = 0;
            for(let i = 0; i < infos.length; i++) { 
                if(infos[i].MatchedPeople.length > 0) { // 매칭 가능한 후보가 있으면 매칭 시작
                    index = i
                    break
                }
                if(i == infos.length - 1) {return response.render('select')} // 매칭이 성사될 수 없는 사람을 제외하고 모든 사람의 매칭이 끝나면 종료
            }

            let max = 0
            for(let j = 1; j < infos[index].MatchedPeople.length; j++) { // 점수가 가장 높은 후보를 선택
                if(infos[index].MatchedScore[max] < infos[index].MatchedScore[j]) max = j;
            }
            let a = infos[index].STnumber
            let b = infos[index].MatchedPeople[max]
            await StudentInfo.updateOne({STnumber: a}, {MatchedPeople: [null], MatchedScore: [null], isMatched: true, selectedPerson: b}) // 선택된 후보를 DB에 저장
            await StudentInfo.updateOne({STnumber: b}, {MatchedPeople: [null], MatchedScore: [null], isMatched: true, selectedPerson: a})
            
            const updateInfos = await StudentInfo.find({isMatched: false})
            for(let i = 1;  i< updateInfos.length; i++) { // 매칭이 완료된 사람들은 다른 사람들의 후보 리스트에서 제외
                index = 0
                for(let j = 0; j < updateInfos[i].MatchedPeople.length; j++) {
                    if(updateInfos[i].MatchedPeople[index] == a || infos[i].MatchedPeople[index] == b) {
                        updateInfos[i].MatchedPeople.splice(index, 1)
                        updateInfos[i].MatchedScore.splice(index, 1)
                        index--
                    }
                    index++
                }
                await StudentInfo.updateOne({STnumber: updateInfos[i].STnumber}, {MatchedPeople: updateInfos[i].MatchedPeople, MatchedScore: updateInfos[i].MatchedScore})
            }
        }

        return response.render('select')
    } catch(error) {
        console.log(error)
    }
}