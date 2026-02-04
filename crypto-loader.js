const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Deriva chave de informações do sistema + constantes do app
function deriveKey() {
    // Combina várias fontes pra gerar a chave
    const parts = [
        'HXD', // prefixo do app
        process.arch, // x64, ia32
        os.platform(), // win32
        os.type(), // Windows_NT
        __dirname.length.toString(36), // tamanho do path em base36
        Buffer.from('aGF4YmFsbC1kZXNrdG9w').toString(), // base64 decode
    ];
    
    const seed = parts.join('|');
    return crypto.createHash('sha256').update(seed).digest();
}

// Deriva IV do nome do arquivo
function deriveIV(filename) {
    return crypto.createHash('md5').update('iv_' + filename + '_hxd').digest();
}

// Criptografa arquivo
function encryptFile(inputPath, outputPath) {
    const key = deriveKey();
    const filename = path.basename(inputPath);
    const iv = deriveIV(filename);
    
    const data = fs.readFileSync(inputPath);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    fs.writeFileSync(outputPath, encrypted);
    
    return true;
}

// Descriptografa arquivo
function decryptFile(inputPath, originalFilename) {
    const key = deriveKey();
    const iv = deriveIV(originalFilename);
    
    const data = fs.readFileSync(inputPath);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    try {
        return Buffer.concat([decipher.update(data), decipher.final()]);
    } catch(e) {
        return null;
    }
}

// Descriptografa pra string (pra JS)
function decryptToString(inputPath, originalFilename) {
    const buf = decryptFile(inputPath, originalFilename);
    return buf ? buf.toString('utf8') : null;
}

// Criptografa pasta inteira de extensões
function encryptExtensions(srcDir, dstDir) {
    fs.mkdirSync(dstDir, { recursive: true });
    
    const files = fs.readdirSync(srcDir);
    const manifest = {};
    
    files.forEach(file => {
        const srcPath = path.join(srcDir, file);
        const stat = fs.statSync(srcPath);
        
        if (stat.isFile()) {
            // Nome criptografado (hash do nome original)
            const encName = crypto.createHash('md5').update('name_' + file).digest('hex').substring(0, 12) + '.enc';
            const dstPath = path.join(dstDir, encName);
            
            encryptFile(srcPath, dstPath);
            manifest[encName] = file;
        }
    });
    
    // Salva manifest criptografado
    const manifestData = JSON.stringify(manifest);
    const manifestPath = path.join(dstDir, 'manifest.enc');
    const key = deriveKey();
    const iv = deriveIV('manifest.json');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encManifest = Buffer.concat([cipher.update(manifestData, 'utf8'), cipher.final()]);
    fs.writeFileSync(manifestPath, encManifest);
    
    return manifest;
}

// Descriptografa extensões pra pasta temp
function decryptExtensions(encDir, dstDir) {
    fs.mkdirSync(dstDir, { recursive: true });
    
    // Lê manifest
    const manifestPath = path.join(encDir, 'manifest.enc');
    if (!fs.existsSync(manifestPath)) return false;
    
    const key = deriveKey();
    const iv = deriveIV('manifest.json');
    const encManifest = fs.readFileSync(manifestPath);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let manifest;
    try {
        const decManifest = Buffer.concat([decipher.update(encManifest), decipher.final()]);
        manifest = JSON.parse(decManifest.toString('utf8'));
    } catch(e) {
        return false;
    }
    
    // Descriptografa cada arquivo
    for (const [encName, origName] of Object.entries(manifest)) {
        const srcPath = path.join(encDir, encName);
        const dstPath = path.join(dstDir, origName);
        
        if (fs.existsSync(srcPath)) {
            const decrypted = decryptFile(srcPath, origName);
            if (decrypted) {
                fs.writeFileSync(dstPath, decrypted);
            }
        }
    }
    
    return true;
}

module.exports = {
    deriveKey,
    encryptFile,
    decryptFile,
    decryptToString,
    encryptExtensions,
    decryptExtensions
};
