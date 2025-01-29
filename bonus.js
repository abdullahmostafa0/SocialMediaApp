var lengthOfLastWord = function(s) {

    const arrWord = s.trim().split(" "); 
    const lastWord = arrWord[arrWord.length - 1];
    return lastWord.length;  
    
};
