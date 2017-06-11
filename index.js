const LOCATOR_NODE = 'dd-tree-node';
let currentPath = [ ];
let tree = [ 'root', null ];
let treeNode = null;

function getIndustriesTree() {
    return getIndustriesSubtree()
        .then((tree)=>{
            let flattened = [];
            tree[1].forEach(recourse);
            function recourse(value){
                flattened.push(value[0]);
                if(value[1]){
                    value[1].forEach(recourse);
                }
            }
            return flattened;
        }).
        then((flat)=>{
            console.log(flat);
            return flat;
        })
}

function getIndustriesSubtree(){
    let root = browser.element.all(by.css(LOCATOR_NODE)).get(0);

    return traversePath(root,currentPath)
        .then((child)=>{
            // если у текущего узла (переменная treeNode) в дереве (переменная tree) нет массива детей, строим его
            if(!treeNode[1]){
                return getH5(child)
                    .then((h5)=>{
                        return h5
                            ?child.click()
                            :null;
                    })
                    .then(()=>{
                        return getNodeChildren(child).then((children)=>{
                            return buildChildren(children);
                        });
                    });
            }
            return treeNode[1];
        })
        .then(( treeChildren )=>{
            console.log(treeChildren);
            if( treeChildren.length ){
                currentPath.push(0);
                console.log('v govno');
                return getIndustriesSubtree();
            }
            else{
                while(currentPath.length){
                    let parentPath = currentPath.slice(0);
                    let bottomLevelIndex = parentPath.pop();
                    let parent = followTreePath(parentPath);
                    if(bottomLevelIndex + 1 < parent[1].length){
                        currentPath[currentPath.length-1]++;
                        console.log('po govnu');
                        return getIndustriesSubtree();
                    }
                    else{
                        console.log('iz govna');
                        currentPath.pop();
                    }
                }
                return tree;
            }
        })
}

function followTreePath(path){
    let node = tree;
    for(let k=0,l=path.length;k<l;k++){
        node=node[1][path[k]];
    }
    return node;
}

function getH5(node){
    return Promise.resolve(node
        .element(by.xpath('./div/h5')));
}

function buildChildren(children){
    return children.reduce(
        (list,child)=>{
            return list instanceof Promise
                ?list.then((list)=>{
                    return getText(child).then((name) => {
                        list.push([name,null]);
                        return list;
                    });
                })
                :getText(child).then((name) => {
                    list.push([name,null]);
                    return list;
                });
        },
        treeNode[1] = []
    )
}

function getText(node){
    return Promise.all([
        node.element(by.xpath('./div/h5/*[contains(@class, "dd-percent")]')).getText(),
        node.element(by.xpath('./div/h5/*[contains(@class, "dd-black dd-tree-node-text")]')).getText()
    ]).then(([percent,text])=>{
        return percent+' '+text;
    })
}

function traversePath(node,path){
    treeNode = tree;
    return Promise.resolve(followPath(node,path.slice(0)));
}

function followPath(node,path){
    if(path.length){
        let index = path[0];
        treeNode = treeNode[1][index];
        return Promise.resolve(
                getNodeChildren(node).get(index)
            )
            .then((child)=> followPath(child,path.slice(1)))
    }
    return node;
}

function getNodeChildren(node){
    return node
        .all(by.xpath('./div/div/div/dd-tree-node'));
}

