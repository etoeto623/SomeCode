#include <stdio.h>
#include <stdlib.h>
#include <conio.h>
#include <malloc.h>
#include <string.h>

void printMenu();
void returnMenu(char *msg);
int validPassword();
void doEncrypt();
void doDecrypt();
char* inputPwd();
int encryptFile( char *sourceFile, char *targetFile, char* secretKey );

const char* pwd = "1991";

int main(){
	system("cls");
	//校验密码
	if( validPassword()==1 ){
		exit(0);
	}
	fflush(stdin);
	char action;
	while(1){
		system("cls");
		printMenu();
		action = getch();
		fflush(stdin);
		system("cls");
		
		switch(action){
			case 'a':
			case 'A':
				doEncrypt();
				break;
			case 'b':
			case 'B':
				doDecrypt();
				break;
			case 'z':
			case 'Z':
				exit(0);
			default:
				returnMenu("没有相应菜单！");
		}
	}
	return 0;
}

// 打印主菜单
void printMenu(){
    printf("******************* 文本加密解密软件 ******************\n");
    printf("*                                                     *\n");
    printf("*      请从下面的菜单中选择你要进行的操作：           *\n");
    printf("*      a. 文件加密                                    *\n");
    printf("*      b. 文件解密                                    *\n");
    printf("*      z. 退出系统                                    *\n");
    printf("*                                                     *\n");
    printf("*******************************************************\n");
}

// 返回主菜单
// msg 为提示语
void returnMenu(char *msg){
	fflush(stdin);
    // system("cls");
    printf("\n%s\n", msg);
    printf("按任意键回到主菜单...\n");
    getch();
} 

//输入并校验密码
int validPassword(){
	// char ipt[5] ;
	//初始化ipt并申请内存地址，也可以使用ipt[3]
	char *ipt = (char*)malloc(sizeof(char)*4); 
	printf("请输入密码：");
	int pwdResult = 1;
	int index = 0;
	while( index < 3 ){
		ipt = inputPwd();
		if( strcmp(ipt,pwd) == 0 ){
			return 0;
		}else{
			if( index==2 ){
				return 1;
			}
			printf("\n密码错误，还有%d次机会,请重输：",3-index-1);		
		}	
		index++;
	}
}

void doEncrypt(){
	char sourceFile[2],targetFile[2], *secretKey;
	printf("输入待加密文件名：");
	scanf("%s",sourceFile);
	printf("输入加密输出文件名：");
	scanf("%s",targetFile);
	printf("输入秘钥：");
	// scanf("%s",secretKey);
	secretKey = inputPwd();
	int result = encryptFile( sourceFile, targetFile, secretKey );
	if( result == 0 ){
		returnMenu("加密文件成功！");
	}else{
		returnMenu("加密文件失败！");
	}
}

void doDecrypt(){
	char sourceFile[2],targetFile[2],*secretKey;
	printf("输入待解密文件名：");
	scanf("%s",sourceFile);
	printf("输入解密输出文件名：");
	scanf("%s",targetFile);
	printf("输入秘钥：");
	secretKey = inputPwd();
	int result = encryptFile( sourceFile, targetFile, secretKey );
	if( result == 0 ){
		returnMenu("解密文件成功！");
	}else{
		returnMenu("解密文件失败！");
	}
}

//加密解密文件
int encryptFile( char *sourceFile, char *targetFile, char* secretKey ){
	FILE *sf = fopen( sourceFile,"rb" );
	if( sf == NULL ){
		printf("\n源文件不存在！\n");
		return 1;
	}
	FILE *tf = fopen( targetFile,"wb" );
	
	int keyLen = strlen( secretKey );
	char buf[keyLen+1];
	int readLen = 0;
	char encryptBuf[keyLen];
	
	while((readLen=fread( buf, sizeof(char), keyLen, sf )) > 0){
		int i = 0;
		while( i < readLen ){
			encryptBuf[i] = buf[i]^secretKey[i];
			i++;
		}
		fwrite( encryptBuf, sizeof(char), readLen, tf );
	}
	fclose(sf);
	fclose(tf);
	return 0;
}

char* inputPwd(){
	int i = 0;
	char *pwd = malloc(sizeof(char));
	char buf;
	while(1){
		buf = getch();
		if( buf == 13 ){
			break;
		}
		pwd[i] = buf;
		i++;
	}
	return pwd;
}