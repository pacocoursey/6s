# 6s [![npm version](https://badge.fury.io/js/6s.svg)](https://badge.fury.io/js/6s)

6s (success */səkˈses/*) is a small CLI script that will change the username of Discord accounts in hopes of forcing a specific discriminator.

![](https://raw.githubusercontent.com/pacocoursey/6s/master/screenshot.png)

## Install

```
$ npm install -g 6s
```
## Usage

```
$ 6s [<files> ...]
```

6s takes an array of JSON configuration files and logs into each of them in parallel. Each configuration file should contain a `password` and `token` field:

```js
{
  "password": "YOUR-PASSWORD-HERE",
  "token": "YOUR-TOKEN-HERE"
}
```

6s will login to Discord with the specified credentials and start seeking desirable discriminators. It will exit when one has been found.

You can't currently change the list of discriminators. At the moment it includes:

```
"0001", "0002", "0003", "0004", "0005", "0006", "0007","0008", "0009", "0010", "0011", "0100", "0111", "1000", "2000", "3000", "4000", "5000", "6000", "7000", "8000", "9000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"
```

## Examples

Seek discriminators on one account:
```
$ 6s config.json
```

Seek discriminators on multiple accounts (in parallel):
```
$ 6s configs/account1.json configs/account2.json configs/account3.json
```

## Disclaimer

There is a **strong** chance that Discord will ban your account for using this tool. I'd recommend buying [Discord Nitro](https://discordapp.com/nitro) if you want your preferred discriminator. That being said, there's nothing against me programming a tool like this. <sup>I think <sup>(hope)</sup></sup>

#

<p align="center">
  <a href="http://paco.sh"><img src="https://raw.githubusercontent.com/pacocoursey/pacocoursey.github.io/master/footer.png" height="300"></a>
</p>
