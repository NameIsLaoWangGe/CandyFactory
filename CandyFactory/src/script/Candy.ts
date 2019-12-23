import MainSceneControl from "./MainSceneControl";
export default class Candy extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**自己身上的碰撞框*/
    private rig: Laya.RigidBody;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**场景脚本组件*/
    private mainSceneControl;

    /**糖果到碰到感应装置时，名字装进这个数组*/
    private nameArr: Array<string>;
    /**糖果运行的速度*/
    private speed: number;

    /**怪物攻击对象*/
    private targetRole: Laya.Sprite;
    /**主角的父节点*/
    private roleParent: Laya.Sprite;

    /**得分显示*/
    public scoreLabel: Laya.Label;

    constructor() { super(); }
    onEnable(): void {
        this.initProperty();
    }

    /**初始化*/
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene as Laya.Scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);//场景脚本组件
        this.roleParent = this.mainSceneControl.roleParent;
        this.nameArr = this.mainSceneControl.nameArr;
        this.scoreLabel = this.mainSceneControl.scoreLabel;
        this.targetRole = null;
        this.rig = this.self.getComponent(Laya.RigidBody) as Laya.RigidBody;
        this.rig.linearVelocity = { x: 0, y: 0.1 };//此处y值必须不等于0才能正常检测碰撞，并不知道为何
        this.speed = 6;
    }

    onTriggerEnter(other: any, self: any, contact: any): void {
        let otherName: string = other.owner.name;
        // 糖果名称
        let name = self.owner.name;
        let candyType = name.substring(0, 11);
        // 初次碰撞把唯一的名称放进数组
        if (otherName === 'induction') {
            this.nameArr.push(name);
        } else if (otherName === 'yellowRole' || otherName === 'redRole') {
            // 防止报错
            if (this.targetRole === null) {
                return;
            }
            this.self.removeSelf();
            // 加血道具,如果满血则加1000分
            if (candyType === 'addBlood___') {
                let tagHealth = this.targetRole.getChildByName('health') as Laya.ProgressBar;
                if (tagHealth.value >= 1) {
                    this.scoreLabel.text = (Number(this.scoreLabel.text) + 1000).toString();
                } else {
                    tagHealth.value += 0.2;
                    if (tagHealth.value >= 1) {
                        tagHealth.value = 1;
                    }
                }
                return;
            }

            // 普通糖果
            let pairName = candyType + otherName;
            let matching_01 = 'yellowCandy' + 'yellowRole';
            let matching_02 = 'redCandy___' + 'redRole';
            if (pairName === matching_01 || pairName === matching_02) {
                this.scoreLabel.text = (Number(this.scoreLabel.text) + 100).toString();
                // 复活，还剩一个主角的时候才有复活选项
                if (this.roleParent._children.length === 1) {
                    this.mainSceneControl.rescueNum++;
                }
            } else {
                // 吃错了就会出现一个敌人，敌人会攻击这个目标
                let mainSceneControl = this.selfScene.getComponent(MainSceneControl);//场景脚本组件
                mainSceneControl.enemyAppear = true;
                // 这个目标位置
                if (this.targetRole.name !== null) {
                    mainSceneControl.tagRoleName = this.targetRole.name;
                }
            }
        }
    }

    onTriggerStay(other: any, self: any, contact: any): void {

    }

    onTriggerExit(other: any, self: any, contact: any): void {
        let otherName = other.owner.name;
        // 碰撞结束删掉
        if (otherName === 'induction') {
            for (let i = 0; i < this.nameArr.length; i++) {
                if (this.nameArr[i] === self.owner.name) {
                    this.nameArr.splice(i, 1);
                }
            }
        }
    }

    onUpdate(): void {
        // 主角全部死亡时停止移动
        if (this.roleParent._children.length === 0) {
            this.rig.linearVelocity = { x: 0, y: 0 }
            return;
        }

        // 超出范围消失
        if (this.self.y > Laya.stage.height + 100 || this.self.y < 0 - 100 || this.self.x > 750 + this.self.width + 50 || this.self.x < -this.self.width) {
            this.self.removeSelf();
        }

        // 判断去向
        if (this.targetRole === null) {
            this.self.y += this.speed;
        } else {
            // 如果this.targetRole从父节点移除了，那么糖果直接下落
            if (this.targetRole.parent === null) {
                this.self.y += 3;
            } else {
                // x,y分别相减是两点连线向量
                let point = new Laya.Point(this.targetRole.x - this.self.x, this.targetRole.y - this.self.y);
                // 归一化，向量长度为1。
                point.normalize();
                //向量相加
                this.self.x += point.x * this.speed * 15 / 8;
                this.self.y += point.y * this.speed * 15 / 8;
            }
        }
    }

    onDisable(): void {
        if (this.self.name === 'yellowCandy') {
            Laya.Pool.recover('yellowCandy', this.self);
        } else if (this.self.name === 'redCandy___') {
            Laya.Pool.recover('redCandy___', this.self);
        }
    }
}