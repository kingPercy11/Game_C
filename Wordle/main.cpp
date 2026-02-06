#include <iostream>
#include <vector>
#include <string>
#include <cstdlib>
#include <ctime>
#include <termios.h>
#include <unistd.h>
#include <fstream>
using namespace std;

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
    vector<string> dict;
    ifstream file("word.txt");
    if(file.is_open()) {
        string word;
        while(file >> word) {
            dict.push_back(word);
        }
        file.close();
    } else {
        dict = {"apple", "grape", "peach", "berry", "mango"};
        cout << "word.txt not found, using default words." << endl;
    }
    
    cout << "WELCOME TO WORDLE! GUESS THE 5-LETTER WORD." << endl;
    string ans = dict[rand() % dict.size()];
    string guess;
    int attempts = 6;
    for(int i = 0; i < attempts; i++) {
        guess = getColoredInput();
        if(wordle(guess, ans)) {
            printf("You guessed the word in %d attempts!\n", i + 1);
            break;
        }
    }
    
}
