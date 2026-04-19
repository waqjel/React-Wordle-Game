export function wordleAlgorithm(word, guess) {
    if (word.length !== guess.length) return null;
    let ordArray = word.toUpperCase().split("");
    let status = [];
    let guessArr = guess.toUpperCase().split("");
    
    guessArr.forEach((char, i) => {
        if (char === ordArray[i]) {
            status[i] = "correct";
            ordArray[i] = null; 
        }
    });

    guessArr.forEach((char, i) => {
        if (status[i]) return;
        
        let foundIndex = ordArray.indexOf(char);
        if (foundIndex !== -1) {
            status[i] = "misplaced";
            ordArray[foundIndex] = null; 
        } else {
            status[i] = "incorrect";
        }
    });
    return status;
}