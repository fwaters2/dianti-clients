[English Version](https://github.com/richardpenman/dianti-clients)

# 電梯挑戰文件

電梯挑戰 [Elevator Challenge](https://dianti.secondspace.dev/) 的目標是要求工程師開發一個高效能的機器人（bot），來模擬電梯運行，並根據乘客的請求來調度電梯，使其以最佳方式運行，以達到最短等待時間和最少移動成本的目標。 🚀

這是一個回合制系統(API 控制回合的進度)，參賽者需要設計電梯控制演算法，讓 bot 根據即時更新的電梯與乘客狀態 來決定電梯的行動。程式會向API伺服器發送指令，API會返回更新後的電梯位置、樓層請求、按鈕狀態等資訊。參賽者的 bot 需要根據這些資訊動態調整策略，確保電梯能夠高效運行，減少等待時間，快速響應乘客需求。

## Examples

以下提供了 API 的相關設定，以及可參考並自行修改的用戶端範例程式碼，方便開發者快速上手並實作自己的電梯控制邏輯。
目前，範例程式碼支援以下程式語言：

- [C++](c++/)
- [C#](csharp/)
- [Golang](golang/)
- [Java](java/)
- [JavaScript](javascript/)
- [Python](python/)
- [Rust](rust/)

如果你使用其他程式語言撰寫了這個用戶端的範例，請提交 [PR](https://github.com/richardpenman/dianti-clients/pulls)，我們將其加入範例程式碼列表！ 🚀

## API

### 初次請求
啟動模擬器時，你需要將 JSON 格式的請求 發送到 `https://dianti.secondspace.dev/api`，請求內容必須包含以下欄位：

| 欄位名稱| 類型 | 說明 |
| :---- | :--- | :---------- |
| bot | string | 機器人的名字|
| building\_name | string |模擬建築的名稱，可從此連結選擇[here](https://dianti.secondspace.dev/buildings) |
| email | string | 你的email (用於製作[Gravatar](https://gravatar.com/)頭像，顯示於積分板|
| event | string | 這次活動的名稱(在積分板中區分不同的活動) |
| sandbox | boolean | 設為 true 則該模擬不會被記錄進積分（用於測試）|


以下是初次請求的格式範例:
```
{
    "bot": "myfirstbot",
    "building_name": "tiny_random",
    "email": "me@mail.com",
    "event": "secondspace2025",
    "sandbox": false,
}
```

<a name="api-response"></a> 
###  API 回應

如果你的請求是正確的，你將會收到 API 回應，回應的欄位如下：

| 欄位名稱 | 類型 | 說明 | 回傳時機 |
| :---- | :--- | :---------- | :------------ |
| cur\_turn | int | 當前回合數 | 每回合 |
| elevators | list[[Elevator](#elevator-type)] | 所有電梯的當前狀態，包括所在樓層及內部請求 | 每回合 |
| errors | list[string] | 任何錯誤訊息 | 每回合 |
| num\_floors | int | 該建築物的樓層數 | 第一回合 |
| num\_turns | int | 這場模擬的總回合數 | 第一回合 |
| requests | list[[Request](#request-type)] | 乘客的電梯請求（包含樓層與方向） | 每回合 |
| replay\_url | string | 這場模擬的重播連結 | 最終回合 |
| running | boolean | 這場模擬是否仍在運行 | 每回合（最終回合時為 false） |
| score | int | 總得分 | 最終回合 |
| token | string | 此模擬的識別碼，必須在所有後續的請求中附上 | 第一回合 |

以下是 `elevators` 欄位的資料：

<a name="elevator-type"></a> 
| 欄位名稱 | 類型 | 說明 |
| :---- | :--- | :---------- |
| buttons\_pressed | list[int] | 電梯內乘客按下的目標樓層 |
| floor | int | 電梯當前所在的樓層 |
| id | string | 電梯的識別碼（ID） |

以下是 `requests` 欄位的資料:
<a name="request-type"></a> 
| 欄位名稱 | 類型 | 說明 |
| :---- | :--- | :---------- |
| direction | boolean | 電梯請求方向，`true` 表示「上樓」，`false` 表示「下樓」 |
| floor | int | 乘客發送電梯請求時所在的樓層 |


以下是完整 API 回應範例:
```
{"cur_turn": 0,
 "elevators": [{"buttons_pressed": [2, 3], "floor": 1, "id": "elevator-0"},
               {"buttons_pressed": [], "floor": 6, "id": "elevator-1"}],
 "errors": ["Unknown elevator ID: elevator-X"],
 "num_floors": 10,
 "num_turns": 30,
 "requests": [{"direction": true, "floor": 2}],
 "replay_url": "https://dianti.secondspace.dev/replay/abc123",
 "running": true,
 "score": 1090,
 "token": "abc123"}
```

### 以下為發送指令（Send Commands）需要的內容

你的 bot 需要分析 API 回應的當前電梯狀態，決定電梯的下一步行動，然後發送請求來改變狀態。  
請求主要包含兩部分：  
模擬識別碼（Token）  
電梯行動指令（commands）  
請求的基本結構:  

| 欄位名稱| 類型 | 說明|
| :---- | :--- | :---------- |
| commands | list[[Command](#command-type)] | 一個包含 Command 物件的陣列，用來指示每部電梯的行動計劃。|
| token | string |初始回合獲取的識別碼，必須在每次請求時附上 |


以下為`Command`電梯行動指令格式:
<a name="command-type"></a> 
| 欄位名稱| 類型| 說明|
| :---- | :--- | :---------- |
| action | boolean | 電梯的動作，true 表示移動，false 表示停止。當電梯停止時，只有與電梯行進方向相同的乘客才會在該樓層進入電梯。 |
| direction | boolean | 電梯行進方向，true 表示上樓，false 表示下樓。|
| elevator\_id | string | 指令控制的電梯ID |

以下是指令請求的範例，elevator_1 在上樓途中停止，而 elevator_2 則繼續向下移動：
```
{
  "commands": [{"action": False, "direction": true, "elevator_id": "elevator_1"},
               {"action": True, "direction": false, "elevator_id": "elevator_2"}],
  "token": "abc123"
}
```

在送出 commands 後，API 會持續回應電梯狀態，直到模擬回合結束。API 回應請參考API 回應的區塊[API Response](#api-response) section.

### 計分機制

分數將根據以下三個部分進行計算:

| 評分標準| 計分方式|
| :---------- | :--- |
|成功抵達目的地的乘客數量| 100 - 1 × 乘客等候的回合數 | 
|回合結束時仍未抵達目的地的乘客數量| -20 - 1 × 乘客等候的回合數|
| 電梯運行耗能 | -1 × 電梯的移動次數|

得分最高的 bot 會顯示在 [high scores](https://dianti.secondspace.dev/highscores) 積分版。 
