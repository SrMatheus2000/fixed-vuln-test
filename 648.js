(params) => {
    const prefix = params.prefix;
    const template = params.template;
    const templateFile = template.file;
    const templateLink = template.link;
    const json = params.data;
    
    const path = json.path;
    const files = json.files;
    
    const sort = params.sort || 'name';
    const order = params.order || 'asc';
    
    /*
     * Строим путь каталога в котором мы находимся
     * со всеми подкаталогами
     */
    const htmlPath = getPathLink(path, prefix, template.pathLink);
    
    let fileTable = rendy(template.path, {
        link        : prefix + FS + path,
        fullPath    : path,
        path        : htmlPath
    });
    
    const owner = 'owner';
    const mode = 'mode';
    
    const getFieldName = getHeaderField(sort, order);
    
    const name = getFieldName('name');
    const size = getFieldName('size');
    const date = getFieldName('date');
    
    const header = rendy(templateFile, {
        tag         : 'div',
        attribute   : 'data-name="js-fm-header" ',
        className   : 'fm-header',
        type        : '',
        name,
        size,
        date,
        owner,
        mode,
    });
    
    /* сохраняем путь */
    Path(path);
    
    fileTable += header + '<ul data-name="js-files" class="files">';
    /* Если мы не в корне */
    if (path !== '/') {
        const dotDot = getDotDot(path);
        const link = prefix + FS + dotDot;
        
        const linkResult = rendy(template.link, {
            link,
            title       : '..',
            name        : '..'
        });
        
        const dataName = 'data-name="js-file-.." ';
        const attribute = 'draggable="true" ' + dataName;
        
        /* Сохраняем путь к каталогу верхнего уровня*/
        fileTable += rendy(template.file, {
            tag         : 'li',
            attribute,
            className   : '',
            type        : 'directory',
            name        : linkResult,
            size        : '&lt;dir&gt;',
            date        : '--.--.----',
            owner       : '.',
            mode        : '--- --- ---'
        });
    }
    
    fileTable += files.map((file) => {
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
    }).join('');
    
    fileTable += '</ul>';
    
    return fileTable;
}