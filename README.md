# OPEN-ACCESS

## Requirements

* NodeJs : The Backend requires NodeJs and a node global package npm.
* Git
* Dockers: For a container installation, Docker is required. Please refer to the docker documentation for docker installation.

## Installation

### NodeJS

Step 1: Clone this repo.

```bash
git clone https://github.com/jupiterbak/OPEN-ACCESS.git
cd OPEN-ACCESS
```

Step 2: Install the dependencies.

```bash
npm install
```

Step 2: Start the application. Run the following

```bash
npm start
```
```

C:\GitHub\OPEN-ACCESS>npm start

> open_access@0.0.1 start C:\GitHub\OPEN-ACCESS
> node open_access.js

3 Dec 15:28:38 - [info] Engine initialized successfully!
3 Dec 15:28:38 - [warn] API module cannot be initialized. Module: ConfigApi - Error: ReferenceError: window is not defined
3 Dec 15:28:38 - [info] Configurator initialized successfully.
OPEN_ACCESS initialized successfully.
3 Dec 15:28:38 - [info] Northbound[dummyNorthBound] started successfully!
3 Dec 15:28:38 - [info] Southbound[dummySouthbound] started successfully!


===============================
OPEN ACCESS engine.welcome
===============================

3 Dec 15:28:38 - [info] runtime.version OPEN ACCESS :0.0.1
3 Dec 15:28:38 - [info] runtime.version Node JSv8.11.1
3 Dec 15:28:38 - [info] Windows_NT 6.1.7601 x64 LE
3 Dec 15:28:38 - [info] Engine started successfully.
3 Dec 15:28:38 - [info] Configurator start successfully.
OPEN_ACCESS start successfully.
3 Dec 15:28:39 - [info] Northbound[dummyNorthBound] ### --> P1 : 0
3 Dec 15:28:39 - [info] Northbound[dummyNorthBound] ### --> P2 : 52.10335941876616

```

The Rest API is now accessible at [http://localhost:55554](http://localhost:55554). And the Documentation at [http://localhost:55554/docs](http://localhost:55554/docs)

<!-- CONTRIBUTING -->
## Contributing

Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->
## Contact

Jupiter Bakakeu - [@JBakakeu](https://twitter.com/JBakakeu) - jupiter.bakakeu@gmail.com

Project Link: [https://github.com/jupiterbak/FAPS_DEMONSTRATOR](https://github.com/jupiterbak/FAPS_DEMONSTRATOR)
