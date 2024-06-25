import spawn from "cross-spawn";
import fs from "node:fs"
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const getDirName = () => dirname(fileURLToPath(import.meta.url))

const buildErrorMessage = (message) => `[2;31m[[0mERROR[2;31m][0m ${message}`
const buildInfoMessage = (message) => `[2;34m[[0mINFO[2;34m][0m ${message}`

const spawnChildProcess = (command, args, cwd) => {
    return new Promise((resolve, reject) => {
        let output = ""

        const process = spawn(command, args, {
            cwd,
            env: {
                FORCE_COLOR: "1"
            }
        })

        process.on("exit", (code) => {
            if(code !== 0) reject("Something went wrong")

            resolve(output.trim())
        })

        process.on("error", (err) => {
            reject(err.message.toString())
        })

        process.stdout.on("data", (data) => {
            output += data
        })
    })
}

const workspaces = JSON.parse(fs.readFileSync(getDirName() + "/../package.json").toString()).workspaces.map((v) => v.replace("/*", ""))

if(!workspaces.includes(process.argv[2])) throw new Error(`Argument must type one of ${workspaces.join(", ")}. Got ${process.argv[2]} instead`)

const packageDir = join(getDirName(), "..", process.argv[2])

const packages = fs.readdirSync(packageDir).filter((folder) => fs.statSync(`${packageDir}/${folder}`).isDirectory() && fs.existsSync(`${packageDir}/${folder}/package.json`))

const totalPackages = packages.length
let successfulPackages = 0

for(let pkg of packages) {
    console.log("")
    const packageInfo = JSON.parse(fs.readFileSync(`${packageDir}/${pkg}/package.json`).toString("utf8"))

    if(!packageInfo.name || !packageInfo.version) {
        console.log(buildErrorMessage(`Directory ${pkg} package.json missing fields name and version ... skipping`))
        console.log('')
        continue;
    }

    if(!packageInfo?.scripts?.build) {
        console.log(buildErrorMessage(`Attempted to build ${packageInfo.name}@${packageInfo.version}. No build scripts were found ...`))
        console.log('')
        continue;
    }

    console.log(buildInfoMessage(`Started building ${packageInfo.name}@${packageInfo.version} ...`))

    try {
        const logs = await spawnChildProcess('yarn', ['build'], `${packageDir}/${pkg}`)

        console.log(buildInfoMessage(`Finished building ${packageInfo.name}@${packageInfo.version}`))
        console.log(`\nLOGS ${packageInfo.name}@${packageInfo.version}\n${logs}`)
        successfulPackages++
    } catch (error) {
        console.log(buildErrorMessage(`Unable to build ${packageInfo.name}@${packageInfo.version}. Got error: ${error.toString()}`))
    }
}

if(successfulPackages === totalPackages) {
    console.log(buildInfoMessage("Building of all packages were successful!"))
} else {
    console.log(buildInfoMessage(`Building of ${successfulPackages} out of ${totalPackages} packages were successful (${Math.round((successfulPackages / totalPackages) * 100)}%)`))
}