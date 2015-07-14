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
	//У������
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
				returnMenu("û����Ӧ�˵���");
		}
	}
	return 0;
}

// ��ӡ���˵�
void printMenu(){
    printf("******************* �ı����ܽ������ ******************\n");
    printf("*                                                     *\n");
    printf("*      �������Ĳ˵���ѡ����Ҫ���еĲ�����           *\n");
    printf("*      a. �ļ�����                                    *\n");
    printf("*      b. �ļ�����                                    *\n");
    printf("*      z. �˳�ϵͳ                                    *\n");
    printf("*                                                     *\n");
    printf("*******************************************************\n");
}

// �������˵�
// msg Ϊ��ʾ��
void returnMenu(char *msg){
	fflush(stdin);
    // system("cls");
    printf("\n%s\n", msg);
    printf("��������ص����˵�...\n");
    getch();
} 

//���벢У������
int validPassword(){
	// char ipt[5] ;
	//��ʼ��ipt�������ڴ��ַ��Ҳ����ʹ��ipt[3]
	char *ipt = (char*)malloc(sizeof(char)*4); 
	printf("���������룺");
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
			printf("\n������󣬻���%d�λ���,�����䣺",3-index-1);		
		}	
		index++;
	}
}

void doEncrypt(){
	char sourceFile[2],targetFile[2], *secretKey;
	printf("����������ļ�����");
	scanf("%s",sourceFile);
	printf("�����������ļ�����");
	scanf("%s",targetFile);
	printf("������Կ��");
	// scanf("%s",secretKey);
	secretKey = inputPwd();
	int result = encryptFile( sourceFile, targetFile, secretKey );
	if( result == 0 ){
		returnMenu("�����ļ��ɹ���");
	}else{
		returnMenu("�����ļ�ʧ�ܣ�");
	}
}

void doDecrypt(){
	char sourceFile[2],targetFile[2],*secretKey;
	printf("����������ļ�����");
	scanf("%s",sourceFile);
	printf("�����������ļ�����");
	scanf("%s",targetFile);
	printf("������Կ��");
	secretKey = inputPwd();
	int result = encryptFile( sourceFile, targetFile, secretKey );
	if( result == 0 ){
		returnMenu("�����ļ��ɹ���");
	}else{
		returnMenu("�����ļ�ʧ�ܣ�");
	}
}

//���ܽ����ļ�
int encryptFile( char *sourceFile, char *targetFile, char* secretKey ){
	FILE *sf = fopen( sourceFile,"rb" );
	if( sf == NULL ){
		printf("\nԴ�ļ������ڣ�\n");
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