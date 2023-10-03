(file) => {
        const name = encode(file.name);
        const link = prefix + FS + path + name;
        
        const type = getType(file.size);
        const size = getSize(file.size);
        
        const date = file.date || '--.--.----';
        const owner = file.owner || 'root';
        const mode = file.mode;
        
        const linkResult = rendy(templateLink, {
            link,
            title: name,
            name,
            attribute: getAttribute(file.size)
        });
        
        const dataName = `data-name="js-file-${name}" `;
        const attribute = `draggable="true" ${dataName}`;
        
        return rendy(templateFile, {
            tag: 'li',
            attribute,
            className: '',
            type,
            name: linkResult,
            size,
            date,
            owner,
            mode,
        });
    }