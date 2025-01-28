# Setup

Install libcurl

On Debian/Ubuntu:

```
sudo apt-get install libcurl4-openssl-dev
```

On macOS (with Homebrew):

```
brew install curl
```

# Build

```
g++ -o random_bot random_bot.cpp -lcurl -std=c++11
g++ -o updown_bot updown_bot.cpp -lcurl -std=c++11
```

# Run

```
./random_bot
./updown_bot
```
