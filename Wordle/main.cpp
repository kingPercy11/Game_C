#include <iostream>
#include <vector>
#include <string>
#include <cstdlib>
#include <ctime>
#include <termios.h>
#include <unistd.h>
#include <fstream>
#include <algorithm>
using namespace std;

bool isValidGuess(string guess, vector<string>& validGuesses) {

    string lowerGuess = guess;
    transform(lowerGuess.begin(), lowerGuess.end(), lowerGuess.begin(), ::tolower);
    return find(validGuesses.begin(), validGuesses.end(), lowerGuess) != validGuesses.end();
}

string getColoredInput() {
    string input = "";
    char ch;
    string gray = "\033[100m\033[97m";
    string reset = "\033[0m";
    
    struct termios oldt, newt;
    tcgetattr(STDIN_FILENO, &oldt);
    newt = oldt;
    newt.c_lflag &= ~(ICANON | ECHO);
    tcsetattr(STDIN_FILENO, TCSANOW, &newt);
    
    while(true) {
        ch = getchar();
        if(ch == '\n' || ch == '\r') {
            break;
        } else if(ch == 127 || ch == 8) { 
            if(!input.empty()) {
                input.pop_back();
                cout << "\r";
                for(int i = 0; i < input.size(); i++) {
                    cout << gray << " " << input[i] << " " << reset;
                }
                cout << "   \r";
                for(int i = 0; i < input.size(); i++) {
                    cout << gray << " " << input[i] << " " << reset;
                }
                cout.flush();
            }
        } else if(isalpha(ch)) {
            input += toupper(ch);
            cout << "\r";
            for(int i = 0; i < input.size(); i++) {
                cout << gray << " " << input[i] << " " << reset;
            }
            cout.flush();
        }
    }
    
    tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
    cout << endl;
    return input;
}
bool wordle(string guess, string ans) {
    string green = "\033[42m\033[97m";  
    string yellow = "\033[43m\033[97m";
    string gray = "\033[100m\033[97m";  
    string reset = "\033[0m";           

    cout << "\033[A\033[2K\r";

    for(int i = 0; i < guess.size(); i++) {
        guess[i] = toupper(guess[i]);
    }
    for(int i = 0; i < ans.size(); i++) {
        ans[i] = toupper(ans[i]);
    }
    
    for(int i = 0; i < guess.size(); i++) {
        if(guess[i] == ans[i]) {
            cout << green << " " << guess[i] << " " << reset;
        } else if(ans.find(guess[i]) != string::npos) {
            cout << yellow << " " << guess[i] << " " << reset;
        } else {
            cout << gray << " " << guess[i] << " " << reset;
        }
    }
    cout << endl;
    return guess == ans; 
}
int main() {
    srand(time(0));
    
    vector<string> answerWords;
    ifstream answerFile("wordle-word.txt");
    if(answerFile.is_open()) {
        string word;
        while(answerFile >> word) {
            answerWords.push_back(word);
        }
        answerFile.close();
    } else {
        answerWords = {"apple", "grape", "peach", "berry", "mango"};
        cout << "wordle-word.txt not found, using default words." << endl;
    }
    
    vector<string> validGuesses;
    ifstream guessFile("wordle-guess.txt");
    if(guessFile.is_open()) {
        string word;
        while(guessFile >> word) {
            validGuesses.push_back(word);
        }
        guessFile.close();
    }
    
    cout << "WELCOME TO WORDLE! GUESS THE 5-LETTER WORD." << endl<<endl;
    string ans = answerWords[rand() % answerWords.size()];
    string guess;
    int attempts = 6;
    bool won = false;
    vector<string> previousGuesses;
    
    for(int i = 0; i < attempts; i++) {
        bool validWord = false;
        while(!validWord) {
            guess = getColoredInput();
            
            string lowerGuess = guess;
            transform(lowerGuess.begin(), lowerGuess.end(), lowerGuess.begin(), ::tolower);
            
            if(!isValidGuess(guess, validGuesses)) {
                cout << "\033[A\033[2K\r";
                cout << "\033[31mNOT A VALID WORD!\033[0m" << endl;
                usleep(500000); 
                cout << "\033[A\033[2K\r"; 
            } else if(find(previousGuesses.begin(), previousGuesses.end(), lowerGuess) != previousGuesses.end()) {

                cout << "\033[A\033[2K\r";
                cout << "\033[33mALREADY GUESSED!\033[0m" << endl;
                usleep(500000); 
                cout << "\033[A\033[2K\r"; 
            } else {
                validWord = true;
                previousGuesses.push_back(lowerGuess);
            }
        }
        
        if(wordle(guess, ans)) {
            printf("You guessed the word in %d attempts!\n", i + 1);
            won = true;
            break;
        }
    }
    
    if(!won) {
        cout << "\nBetter luck next time!" << endl;
        cout << "The word was: ";
        
        string green = "\033[42m\033[97m";
        string reset = "\033[0m";
        string upperAns = ans;
        for(int i = 0; i < upperAns.size(); i++) {
            upperAns[i] = toupper(upperAns[i]);
        }
        for(int i = 0; i < upperAns.size(); i++) {
            cout << green << " " << upperAns[i] << " " << reset;
        }
        cout << endl;
    }
    
}
